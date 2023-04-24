<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://badgen.net/npm/v/homebridge-gpio-doorbell/latest?icon=npm&label)](https://www.npmjs.com/package/homebridge-gpio-doorbell)
[![npm](https://badgen.net/npm/dt/homebridge-gpio-doorbell?label=downloads)](https://www.npmjs.com/package/homebridge-gpio-doorbell)
[![release](https://badgen.net/github/release/silviokennecke/homebridge-gpio-doorbell)](https://github.com/silviokennecke/homebridge-gpio-doorbell/releases)
[![license](https://badgen.net/github/license/silviokennecke/homebridge-gpio-doorbell)](https://github.com/silviokennecke/homebridge-gpio-doorbell/blob/main/LICENSE)
[![lint & build](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/build.yml/badge.svg)](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/build.yml)

# Homebridge GPIO doorbell

This plugin listens the GPIO input of the Raspberry PI and passes it as a HomeKit doorbell.

Alternatively you can use this plugin to trigger a doorbell exposed by [homebridge-camera-ffmpeg](https://www.npmjs.com/package/homebridge-camera-ffmpeg) or [homebridge-camera-ui](https://www.npmjs.com/package/homebridge-camera-ui).

> :warning: This plugin is only designed for and tested on Raspberry PI.
> There's no guarantee, the plugin works also on other boards equipped with GPIO!

## Configuration

| key | type | description |
|---|---|---|
| name | string | The name of the accessory. | 
| gpioPin | integer | The GPIO pin the plugin should listen to. | 
| throttleTime | integer | How many milliseconds should another ring be ignored after the doorbell rang last? | 
| reverseInput | boolean | If enabled, a high input on the gpio pin is interpreted as low and the other way around. |
| enableOutput | boolean | If enabled, a doorbell ring causes a specified GPIO pin to be set HIGH simultaneously. |
| outputGpioPin | integer | The output GPIO pin. |
| enableHttpTrigger | boolean | Enables performing an HTTP GET request when the doorbell rang. This way you can use the doorbell implementation of plugins like homebridge-camera-ffmpeg or homebridge-camera-ui. Enabling this, causes the doorbell accessory exposed by this plugin to not ring. |
| httpTriggerUrl | string | The URL the HTTP GET request should be performed to. |

## Wiring

> :warning: **In case of incorrect wiring you can damage your PI!**

![Wiring Sample](docs/wiring.png)

### Doorbell input

To connect your doorbell to your PI via GPIO, connect a GPIO pin with GND and the button, relay, etc. and a resistor between.

> :warning: Most doorbells run with 12V AC.
> Therefore, you cannot attach your doorbell directly to your PI.
> You will need a rectifier, capacitor and relay in between for instance.
> The more easy way would be to directly use an AC relay.

### Doorbell output

Optionally you can add a separate output which is triggered when the doorbell rings.
This way you can keep your existing bell working or add a separate buzzer for instance.

### Add to camera

Since version 2.1 you can also use this plugin to trigger a webhook. This way you can use the exposed doorbell by [homebridge-camera-ffmpeg](https://www.npmjs.com/package/homebridge-camera-ffmpeg) or [homebridge-camera-ui](https://www.npmjs.com/package/homebridge-camera-ui). Enabling the webhook will cause the doorbell exposed by this plugin to not be triggered anymore.

For setup first open the `homebridge-camera-ffmpeg` plugin configuration and enable the HTTP Server under "Global Automation" by assigning a port (e.g. 8080) to it. Also, click the "Enable Doorbell" switch in "Automation" for the camera you want to use. Save the changes and open the `homebridge-gpio-doorbell` configuration. Enable the "Enable HTTP Webhook" option and enter the webhook url for triggering the ffmpeg doorbell (e.g. `http://127.0.0.1/doorbell?NameOfVideoCamera`). Save the configuration an restart homebridge. When ringing the doorbell now, your camera exposed by homebridge-camera-ffmpeg will ring and a video stream is shown in the push notification on your iPhone, Apple Watch, etc..


### notes

edit: 
package.json
package-lock

## Support & Contribution

This project is not commercially developed or maintained.
Therefore, it might take some time after opening an issue until it is solved.
But anyway: If you experience any bugs feel free to open an issue or create a pull request.
Contribution is always welcome.
