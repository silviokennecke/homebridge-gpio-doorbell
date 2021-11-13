<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

[![npm](https://badgen.net/npm/v/homebridge-gpio-doorbell/latest?icon=npm&label)](https://www.npmjs.com/package/homebridge-gpio-doorbell)
[![npm](https://badgen.net/npm/dt/homebridge-gpio-doorbell?label=downloads)](https://www.npmjs.com/package/homebridge-gpio-doorbell)
[![release](https://badgen.net/github/release/silviokennecke/homebridge-gpio-doorbell)](https://github.com/silviokennecke/homebridge-gpio-doorbell/releases)
[![license](https://badgen.net/github/license/silviokennecke/homebridge-gpio-doorbell)](https://github.com/silviokennecke/homebridge-gpio-doorbell/blob/main/LICENSE)
[![Node.js Package](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/npm-publish.yml)
[![Node.js CI](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/npm-test.yml/badge.svg?branch=main)](https://github.com/silviokennecke/homebridge-gpio-doorbell/actions/workflows/npm-test.yml)

# Homebridge GPIO doorbell

This plugin listens the GPIO input of the Raspberry PI and passes it as a HomeKit doorbell.

> :warning: This plugin is only designed for and tested on Raspberry PI.
> There's no guarantee, the plugin works also on other boards equipped with GPIO!

## Configuration

| key | type | description |
|---|---|---|
| gpioPin | integer | The GPIO pin the plugin should listen to. | 
| reverseInput | boolean | If enabled, a high input on the gpio pin is interpreted as low and the other way around. |

## Support & Contribution

This project is not commercially developed or maintained.
Therefore, it might take some time after opening an issue until it is solved.
But anyway: If you experience any bugs feel free to open an issue or create a pull request.
Contribution is always welcome.
