import { InputSystem } from '@/renderer/InputSystem/InputSystem'
import { buttons, sticks } from '@/renderer/InputSystem/mappings'
import { rosClient } from '@/renderer/utils/ros/rosClient'
import { Action } from '@/renderer/InputSystem/@types'
import { TopicOptions } from '@/renderer/utils/ros/roslib-ts-client/@types'
import { ITwistMsg, IJoyMsg } from '@/renderer/utils/ros/rosMsgs.types'
import { Vector3 } from '@/renderer/utils/math/types'
import { controlService } from '@/renderer/state/control'
import { feedSlice } from '@/renderer/store/modules/feed/reducer'
import { store } from '@/renderer/store/store'
import { flipperService } from '@/renderer/state/flipper'

export const cmdVelTopic: TopicOptions = {
  name: 'markhor/diff_drive_controller/cmd_vel',
  messageType: 'geometry_msgs/Twist',
}

export const joyTopic: TopicOptions = {
  name: '/joy',
  messageType: 'sensor_msgs/Joy',
}

export const spaceMouseTopic: TopicOptions = {
  name: '/spacenav/twist',
  messageType: 'geometry_msgs/Twist',
}

export const gamepadTopic: TopicOptions = {
  name: '/gamepad',
  messageType: 'geometry_msgs/Twist',
}

let joySeqId = 0

export const mapGamepadToJoy = (gamepad: Gamepad): IJoyMsg => {
  const d = new Date()
  const seconds = Math.round(d.getTime() / 1000)

  const deadzone = 0.09
  const axes = gamepad.axes.map((x) =>
    x < deadzone && x > -deadzone ? 0.0 : x
  )
  const buttons = gamepad.buttons.map((x) => Math.floor(x.value))

  return {
    header: {
      seq: joySeqId++,
      stamp: {
        sec: seconds,
        nsecs: 0,
      },
      frame_id: '',
    },
    axes,
    buttons,
  }
}

export const mapToTwist = (
  horizontal: number,
  vertical: number,
  rt: number,
  lt: number
): ITwistMsg => {
  const deadzone = 0.15
  const x = horizontal > deadzone ? -1 : horizontal < -deadzone ? 1 : 0
  const y = vertical > deadzone ? 1 : vertical < -deadzone ? -1 : 0

  if (lt > 0.1) {
    // brake!
    return { linear: Vector3.zero(), angular: Vector3.zero() }
  }

  return {
    linear: new Vector3(y * rt, 0, 0),
    angular: new Vector3(0, 0, x * rt),
  }
}

export const mapSpaceMouseToTwist = (spacemouse: Gamepad): ITwistMsg => {
  const { axes } = spacemouse

  return {
    linear: new Vector3(axes[0], axes[1], axes[2]),
    angular: new Vector3(axes[3], axes[4], axes[5]),
  }
}

const getBtnValue = (rawBtn: GamepadButton) => {
  if (!rawBtn) {
    return 0
  }
  return typeof rawBtn == 'number' ? rawBtn : rawBtn.value
}

const defaultActions: Action[] = [
  {
    name: 'estop',
    bindings: [
      { type: 'keyboard', code: 'Space', onKeyDown: true },
      { type: 'gamepadBtn', button: buttons.XBOX },
    ],
    perform: (ctx) => {
      // TODO use redux to toggle the estop and the related UI elements
      // This only disables the drives, if you want to restart it you need to use the UI
      if (controlService.state.matches('nothing') && ctx.type === 'keyboard') {
        return
      }
      rosClient
        .callService({ name: 'markhor/estop_disable' })
        .catch(console.error)
    },
  },
  {
    name: 'toggleArmControl',
    bindings: [{ type: 'gamepadBtn', button: buttons.dpad.right }],
    perform: () => {
      controlService.send('TOGGLE')
    },
  },
  {
    name: 'flipperFront',
    bindings: [
      { type: 'gamepadBtn', button: buttons.dpad.up },
      { type: 'keyboard', code: 'KeyI' },
    ],
    perform: () => {
      flipperService.send('MODE_FRONT')
      rosClient
        .callService({ name: 'markhor/flipper_mode_front' })
        .catch(console.error)
    },
  },
  {
    name: 'flipperBack',
    bindings: [
      { type: 'gamepadBtn', button: buttons.dpad.down },
      { type: 'keyboard', code: 'KeyK' },
    ],
    perform: () => {
      flipperService.send('MODE_BACK')
      rosClient
        .callService({ name: 'markhor/flipper_mode_back' })
        .catch(console.error)
    },
  },
  {
    name: 'switchForwardDirection',
    bindings: [
      { type: 'gamepadBtn', button: buttons.back },
      { type: 'keyboard', code: 'KeyT', onKeyDown: true },
    ],
    perform: () => {
      // TODO use direction service when implemented
      rosClient.callService({ name: 'switch_direction' }).catch(console.error)
      store.dispatch(feedSlice.actions.switchDirection())
    },
  },
  {
    name: 'headlights',
    bindings: [{ type: 'gamepadBtn', button: buttons.dpad.left }],
    perform: () => {
      rosClient.callService({ name: '/headlights' }).catch(console.error)
    },
  },
  {
    name: 'movement',
    bindings: [{ type: 'gamepad' }],
    perform: (ctx) => {
      if (ctx.type !== 'gamepad') {
        return
      }
      if (!controlService.state.matches('flipper')) {
        return
      }

      const { gamepad } = ctx.gamepadState
      const { axes } = gamepad
      const gpButtons = gamepad.buttons

      const twist = mapToTwist(
        axes[sticks.left.horizontal],
        axes[sticks.left.vertical],
        getBtnValue(gpButtons[buttons.RT]),
        getBtnValue(gpButtons[buttons.LT])
      )

      rosClient.publish(cmdVelTopic, twist)
    },
  },
  {
    name: 'spacemouse',
    bindings: [{ type: 'spacemouse' }],
    perform: (ctx) => {
      if (ctx.type !== 'spacemouse') {
        return
      }
      if (!controlService.state.matches('arm')) {
        return
      }

      const joy = mapGamepadToJoy(ctx.gamepadState.gamepad)
      rosClient.publish(spaceMouseTopic, joy)
    },
  },
  {
    name: 'gamepad',
    bindings: [{ type: 'gamepad' }],
    perform: (ctx) => {
      if (ctx.type !== 'gamepad') {
        return
      }
      const joy = mapGamepadToJoy(ctx.gamepadState.gamepad)
      rosClient.publish(joyTopic, joy)
    },
  },
]

const inputsys = new InputSystem(defaultActions)

export default inputsys
