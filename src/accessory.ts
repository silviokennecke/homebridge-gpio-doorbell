import {
  AccessoryPlugin,
  API,
  Logger,
} from 'homebridge';
import storage from 'node-persist';

import GPIO from 'rpi-gpio';
import {AccessoryConfig} from 'homebridge/lib/bridgeService';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class GpioDoorbellAccessory implements AccessoryPlugin {
  private storage;

  private informationService;
  private doorbellService;
  private muteCharacteristic;

  private lastRang?: number;

  private readonly doorbellMuteKey = 'homebridge-gpio-doorbell.mute';
  private doorbellMute: boolean|null = null;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.log.debug('Homebridge GPIO Doorbell loaded.');

    // init storage
    const cacheDir = this.api.user.persistPath();
    this.storage = storage.create();
    this.storage.initSync({dir: cacheDir, forgiveParseErrors: true});

    // add accessory information
    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(this.api.hap.Characteristic.Model, 'GPIO Doorbell');

    // create new doorbell accessory
    this.doorbellService = new this.api.hap.Service.Doorbell(this.config.name);

    // add characteristic ProgrammableSwitchEvent
    this.doorbellService.getCharacteristic(this.api.hap.Characteristic.ProgrammableSwitchEvent);

    // setup mute characteristic
    if (this.config.enableOutput) {
      this.muteCharacteristic = this.doorbellService.getCharacteristic(this.api.hap.Characteristic.Mute);
      this.muteCharacteristic.onGet(this.handleMuteGet.bind(this));
      this.muteCharacteristic.onSet(this.handleMuteSet.bind(this));
    }

    // restore persisted settings
    this.handleMuteGet();

    // setup gpio
    this.setupGpio();
  }

  getServices() {
    return [
      this.informationService,
      this.doorbellService,
    ];
  }

  setupGpio(): void {
    GPIO.on('change', (channel, value) => this.handlePinChange(channel, value));
    GPIO.setup(this.config.gpioPin, GPIO.DIR_IN, GPIO.EDGE_BOTH);

    if (this.config.enableOutput) {
      this.log.debug(`Enable output on pin ${this.config.outputGpioPin}`);

      GPIO.setup(this.config.outputGpioPin, GPIO.DIR_LOW);
    }
  }

  /**
   * @param gpioPin
   * @param circuitOpen true when circuit is open, false if circuit is closed
   * @private
   */
  private handlePinChange(gpioPin: number, circuitOpen: boolean): void {
    this.log.debug(`Pin ${gpioPin} changed state to ${circuitOpen}.`);

    let buttonPushed = !circuitOpen;

    if (this.config.negateInput) {
      buttonPushed = !buttonPushed;
    }

    // handle GPIO output
    if (this.config.enableOutput && !this.doorbellMute) {
      this.log.debug(`Setting GPIO pin ${this.config.outputGpioPin} to ${buttonPushed ? 'HIGH' : 'LOW'}`);

      GPIO.write(this.config.outputGpioPin, buttonPushed);
    }

    if (buttonPushed) {
      // handle throttle time
      const now = Date.now();
      if (this.lastRang && (this.lastRang + this.config.throttleTime) >= now) {
        this.log.debug(`Ignoring state change on pin ${gpioPin} because throttle time has not expired.`);
        return;
      } else {
        this.lastRang = Date.now();
      }

      // forward ring to homekit
      this.log.info(`Doorbell "${this.config.name}" rang.`);

      this.doorbellService.updateCharacteristic(
        this.api.hap.Characteristic.ProgrammableSwitchEvent,
        this.api.hap.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
      );
    }
  }

  private handleMuteSet(value: boolean): void {
    this.log.debug(`Set mute to ${value}.`);

    this.doorbellMute = value;
    this.storage.setItemSync(this.doorbellMuteKey, this.doorbellMute);

    if (!this.doorbellMute && this.config.enableOutput) {
      GPIO.write(this.config.outputGpioPin, false);
    }
  }

  private handleMuteGet(): boolean {
    this.log.debug('Get mute.');

    if (this.doorbellMute === null) {
      const persisted = this.storage.getItemSync(this.doorbellMuteKey);

      this.handleMuteSet(!!persisted);
    }

    return this.doorbellMute as boolean;
  }
}
