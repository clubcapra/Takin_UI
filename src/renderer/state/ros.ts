import { Machine, assign, interpret } from 'xstate'
import { rosClient } from '@/renderer/utils/ros/rosClient'
import { toast } from 'react-toastify'
import { ICameraData } from '@/renderer/store/modules/feed/@types'

interface RosContext {
  IP: string
  port: string
  videoServerPort: string
  connectingToastId: string
  errorToastId: string
  descriptionServerPort: string
  baseLinkName: string
}

interface RosStateSchema {
  states: {
    connected: Record<string, unknown>
    connecting: Record<string, unknown>
    disconnected: Record<string, unknown>
  }
}

type RosEvent =
  | { type: 'DISCONNECT' }
  | { type: 'CONNECT' }
  | { type: 'FAIL' }
  | { type: 'SUCCESS' }
  | {
      type: 'SET_IP'
      IP: string
    }
  | {
      type: 'SET_PORT'
      port: string
    }
  | {
      type: 'SET_VIDEO_SERVER_PORT'
      port: string
    }
  | {
      type: 'SET_DESCRIPTION_SERVER_PORT'
      port: string
    }
  | {
      type: 'SET_BASE_LINK_NAME'
      name: string
    }

const formatFullAddress = (IP: string, port: string): string => `${IP}:${port}/`

export const fullAddressSelector = ({ IP, port }: RosContext) =>
  formatFullAddress(IP, port)

export const videoUrlSelector =
  (camera: ICameraData, param: 'stream' | 'snapshot' = 'stream') =>
  (state: RosContext): string =>
    `http://${state.IP}:${state.videoServerPort}/${param}?topic=${camera.topic}&type=${camera.type}`

const setters = {
  SET_IP: {
    actions: 'updateIP',
  },
  SET_PORT: {
    actions: 'updatePort',
  },
  SET_VIDEO_SERVER_PORT: {
    actions: 'updateVideoServerPort',
  },
  SET_DESCRIPTION_SERVER_PORT: {
    actions: 'updateDescriptionServerPort',
  },
  SET_BASE_LINK_NAME: {
    actions: 'updateBaseLinkName',
  },
}

export const rosMachine = Machine<RosContext, RosStateSchema, RosEvent>(
  {
    id: 'ros',
    initial: 'disconnected',
    context: {
      IP: '192.168.1.150',
      port: '9090',
      videoServerPort: '8080',
      connectingToastId: '',
      errorToastId: '',
      descriptionServerPort: '88',
      baseLinkName: 'markhor_link_base',
    },
    states: {
      connected: {
        on: {
          DISCONNECT: { target: 'disconnected', actions: 'toastDisconnect' },
          CONNECT: 'connecting',
          ...setters,
        },
      },
      connecting: {
        entry: ['rosClientConnect', 'toastConnecting'],
        on: {
          SUCCESS: { target: 'connected', actions: 'toastSuccess' },
          FAIL: { target: 'disconnected', actions: 'toastFail' },
        },
      },
      disconnected: {
        on: {
          CONNECT: 'connecting',
          ...setters,
        },
      },
    },
  },
  {
    actions: {
      rosClientConnect: ({ IP, port }) => {
        rosClient.connect(IP, port)
      },
      rosClientDisconnect: () => {
        rosClient.disconnect()
      },
      toastSuccess: (ctx) => {
        toast.dismiss(ctx.connectingToastId)
        toast.info(`ROS: Connected to: ${fullAddressSelector(ctx)}`)
      },
      toastFail: (ctx) => {
        const id = toast.error(
          `ROS: Failed to connect to: ${fullAddressSelector(ctx)}`
        )
        assign({ errorToastId: id })
      },
      toastConnecting: (ctx) => {
        toast.dismiss(ctx.errorToastId)
        toast.dismiss(ctx.connectingToastId)
        const id = toast.warn(
          `ROS: Trying to connect to: ${fullAddressSelector(ctx)}`
        )
        assign({ connectingToastId: id })
      },
      toastDisconnect: (ctx) => {
        toast.dismiss(ctx.connectingToastId)
        toast.warn(`ROS: Lost connection to: ${fullAddressSelector(ctx)}`)
      },
      updateIP: assign({
        IP: (_, event) => {
          if (event.type !== 'SET_IP') {
            throw new Error()
          } else {
            return event.IP
          }
        },
      }),
      updatePort: assign({
        port: (_, event) => {
          if (event.type !== 'SET_PORT') {
            throw new Error()
          } else {
            return event.port
          }
        },
      }),
      updateVideoServerPort: assign({
        videoServerPort: (_, event) => {
          if (event.type !== 'SET_VIDEO_SERVER_PORT') {
            throw new Error()
          } else {
            return event.port
          }
        },
      }),
      updateDescriptionServerPort: assign({
        descriptionServerPort: (_, event) => {
          if (event.type !== 'SET_DESCRIPTION_SERVER_PORT') {
            throw new Error()
          } else {
            return event.port
          }
        },
      }),
      updateBaseLinkName: assign({
        descriptionServerPort: (_, event) => {
          if (event.type !== 'SET_BASE_LINK_NAME') {
            throw new Error()
          } else {
            return event.name
          }
        },
      }),
    },
  }
)

export const rosService = interpret(rosMachine).start()
