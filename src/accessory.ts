import {
  API,
  Logger,
  AccessoryPlugin,
} from 'homebridge';

import GPIO from 'rpi-gpio';
import {AccessoryConfig} from 'homebridge/lib/bridgeService';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class GpioDoorbellAccessory implements AccessoryPlugin {
  private informationService;
  private doorbellService;

  private lastRang?: number;

  constructor(
    public readonly log: Logger,
    public readonly config: AccessoryConfig,
    public readonly api: API,
  ) {
    this.log.debug('Homebridge GPIO Doorbell loaded.');

    // your accessory must have an AccessoryInformation service
    this.informationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(this.api.hap.Characteristic.Model, 'GPIO Doorbell');

    // create a new "Switch" service
    this.doorbellService = new this.api.hap.Service.Doorbell(this.config.name);

    // link methods used when getting or setting the state of the service
    this.doorbellService.getCharacteristic(this.api.hap.Characteristic.ProgrammableSwitchEvent);

    this.setupGpio();
  }

  /**
   * REQUIRED - This must return an array of the services you want to expose.
   * This method must be named "getServices".
   */
  getServices() {
    return [
      this.informationService,
      this.doorbellService,
    ];
  }

  setupGpio(): void {
    GPIO.on('change', (channel, value) => this.handlePinChange(channel, value));
    GPIO.setup(this.config.gpioPin, GPIO.DIR_IN, GPIO.EDGE_BOTH);
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

    if (buttonPushed) {
      const now = Date.now();
      if (this.lastRang && (this.lastRang + this.config.throttleTime) >= now) {
        this.log.debug(`Ignoring state change on pin ${gpioPin} because throttle time has not expired.`);
        return;
      } else {
        this.lastRang = Date.now();
      }

      this.log.info(`Doorbell "${this.config.name}" rang.`);

      this.doorbellService.updateCharacteristic(
        this.api.hap.Characteristic.ProgrammableSwitchEvent,
        this.api.hap.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
      );
    }
  }
}
