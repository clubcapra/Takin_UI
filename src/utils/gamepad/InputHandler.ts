import { gamepadModule } from '@/store'
import CustomGamepad from './CustomGamepad'
import RosClient from '@/utils/ros/RosClient'
import {
  mapGamepadToJoy,
  mapGamepadToTwist,
  cmdVelTopic,
  joyTopic,
} from './RosGamepadUtils'
import { GamepadBtn, Dpad } from './mappings/types'

export class InputHandler {
  private headlightsOn: Boolean = false
  private isArmTogglePressed = false

  handleGamepadInput(gamepad: CustomGamepad, prevGamepad: CustomGamepad) {
    this.handleControlMode(gamepad)

    if (gamepadModule.isArmControlled) {
      this.handleArmControl(gamepad)
    } else {
      this.handleRobotControl(gamepad)
    }

    this.handleHeadLight(gamepad)
  }

  private handleRobotControl(gamepad: CustomGamepad) {
    if (gamepad.getButtonPressed(GamepadBtn.A)) {
      RosClient.publish(cmdVelTopic, mapGamepadToTwist(gamepad))
    }
  }
  private handleArmControl(gamepad: CustomGamepad) {
    RosClient.publish(joyTopic, mapGamepadToJoy(gamepad.gamepad))
  }

  private handleControlMode(gamepad: CustomGamepad) {
    if (gamepad.getButtonPressed(Dpad.Right) && !this.isArmTogglePressed) {
      gamepadModule.toggleIsArmControlled()
      this.isArmTogglePressed = true
    } else if (
      !gamepad.getButtonPressed(Dpad.Right) &&
      this.isArmTogglePressed
    ) {
      this.isArmTogglePressed = false
    }
  }

  private handleHeadLight(gamepad: CustomGamepad) {
    if (gamepad.getButtonPressed(Dpad.Left) && this.headlightsOn) {
      RosClient.callService({ name: '/headlights', serviceType: '' }, '')
      this.headlightsOn = true
    } else if (!gamepad.getButtonPressed(Dpad.Left) && !this.headlightsOn) {
      this.headlightsOn = false
    }
  }
}
