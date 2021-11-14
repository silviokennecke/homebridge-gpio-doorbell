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

  private readonly doorbellMuteKeyPrefix = 'homebridge-gpio-doorbell.mute.';
  private doorbellMute = false;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.log.debug('Homebridge GPIO Doorbell loaded.');
    this.setup();
  }

  private async setup(): Promise<void> {
    const cacheDir = this.api.user.persistPath();
    this.storage = storage;
    await this.storage.init({dir: cacheDir});

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
    if (this.config.enableOutput) {
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

  /**
   * @param value
   * @private
   */
  private async handleMuteSet(value: boolean): Promise<void> {
    this.doorbellMute = value;
    await this.storage.setItem(this.doorbellMuteKeyPrefix + this.config.name, this.doorbellMute);

    if (!this.doorbellMute && this.config.enableOutput) {
      GPIO.write(this.config.outputGpioPin, false);
    }
  }

  /**
   * @private
   */
  private async handleMuteGet(): Promise<boolean> {
    if (this.doorbellMute === null) {
      const persisted = await this.storage.getItem(this.doorbellMuteKeyPrefix + this.config.name);

      await this.handleMuteSet(!!persisted);
    }

    return this.doorbellMute;
  }
}
