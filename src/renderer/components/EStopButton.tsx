import React, { FC, useState } from 'react'
import { Modal } from './common/Modal'
import { Button } from './common/Button'
import { rosClient } from '@/renderer/utils/ros/rosClient'
import { useRosSubscribe } from '@/renderer/hooks/useRosSubscribe'
import { TopicOptions } from '@/renderer/utils/ros/roslib-ts-client/@types'
import { useOpenClose } from '@/renderer/hooks/useOpenClose'
import { styled } from '@/renderer/globalStyles/styled'
import { darken } from 'polished'
import { log } from '@/renderer/logger'

const topic: TopicOptions<boolean> = {
  name: 'markhor/estop_status',
  messageType: 'std_msgs/Bool',
}

interface StopButtonProps {
  onClick: () => void
}

const StopButton: FC<StopButtonProps> = ({ onClick }) => {
  const [text, setText] = useState('EMERGENCY STOP')

  useRosSubscribe(topic, (message) => {
    if (message.data) {
      setText('EMERGENCY STOP')
    } else {
      setText('REARM')
    }
  })

  return (
    <StyledStopButton onClick={onClick}>
      <span>{text}</span>
    </StyledStopButton>
  )
}

export const EStopButton: FC = () => {
  const [isModalOpen, openModal, closeModal] = useOpenClose()

  const stopRobot = () => {
    log.info('ESTOP: stopping robot')
    rosClient
      .callService({ name: 'markhor/estop_disable', serviceType: '' }, '')
      .catch(log.error)
    openModal()
  }

  const restartRobot = () => {
    log.info('ESTOP: restarting robot')
    rosClient
      .callService({ name: 'markhor/estop_enable', serviceType: '' }, '')
      .catch(log.error)
    closeModal()
  }

  return (
    <>
      <StopButton onClick={stopRobot} />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={'Warning!'}
        footer={
          <div style={{ display: 'flex' }}>
            <Button onClick={restartRobot} btnType="success">
              Yes
            </Button>
            <Button onClick={closeModal} btnType="danger">
              No
            </Button>
          </div>
        }
      >
        <p>Robot is currently stopped.</p>
        <p>Do you want to restart it?</p>
      </Modal>
    </>
  )
}

const StyledStopButton = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.fontLight};

  &:hover {
    box-shadow: inset 0 0 2px #000000;
  }

  &:active {
    box-shadow: inset 0 0 6px #000000;
    background-color: ${({ theme }) => darken(0.05, theme.colors.primary)};
  }

  span {
    font-weight: bold;
    font-size: 1.8em;
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
`
