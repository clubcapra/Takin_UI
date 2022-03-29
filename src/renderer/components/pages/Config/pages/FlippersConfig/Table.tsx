import React, { FC, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import {
  feedSlice,
  IFlippersFeed,
  IFlippersData,
  selectAllFlippers,
} from '@/renderer/store/modules/feed'
import { FaTimes } from 'react-icons/fa'
import { useSelector } from '@/renderer/hooks/typedUseSelector'
import { Input } from '@/renderer/components/common/Input'
import { TopicOptions } from '@/renderer/utils/ros/roslib-ts-client/@types'
import { styled } from '@/renderer/globalStyles/styled'

const TableRow: FC<{
  feed: IFlippersFeed
  updateTopic: (
    id: string
  ) => (field: keyof TopicOptions, value: string) => void
  updateName: (id: string) => (value: string) => void
}> = ({ feed, updateTopic, updateName }) => {
  const {
    id,
    flippers: {
      name,
      topic: { name: topicName, messageType },
    },
  } = feed

  const dispatch = useDispatch()
  const removeFlippers = () => dispatch(feedSlice.actions.removeFeed(id))
  const updateTopicId = updateTopic(id)
  const updateNameId = updateName(id)

  return (
    <tr>
      <td>
        <Input
          type="text"
          value={name}
          onChange={(e) => updateNameId(e.target.value)}
        />
      </td>
      <td>
        <Input
          type="text"
          value={topicName}
          onChange={(e) => updateTopicId('name', e.target.value)}
        />
      </td>
      <td>
        <Input
          type="text"
          value={messageType}
          onChange={(e) => updateTopicId('messageType', e.target.value)}
        />
      </td>
      <td>
        <div onClick={removeFlippers}>
          <FaTimes />
        </div>
      </td>
    </tr>
  )
}

export const Table: FC = () => {
  const dispatch = useDispatch()
  const allFlippers = useSelector(selectAllFlippers)

  const updateTopic = useCallback(
    (id: string) =>
      (field: keyof TopicOptions, value: string): void => {
        const feed = allFlippers.find((f) => f.id === id)
        if (!feed) {
          return
        }

        const newFlippers: IFlippersData = {
          ...feed.flippers,
          topic: { ...feed.flippers.topic, [field]: value },
        }

        dispatch(
          feedSlice.actions.updateFlippers({
            flippers: newFlippers,
            id,
          })
        )
      },
    [allFlippers, dispatch]
  )

  const updateName = useCallback(
    (id: string) =>
      (value: string): void => {
        const feed = allFlippers.find((f) => f.id === id)
        if (!feed) {
          return
        }
        const newGraph: IFlippersData = { ...feed.flippers, name: value }
        dispatch(
          feedSlice.actions.updateGraph({
            graph: newGraph,
            id,
          })
        )
      },
    [allFlippers, dispatch]
  )

  return (
    <StyledTable>
      <thead>
        <tr>
          <th>Name</th>
          <th>Topic</th>
          <th>Message Type</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {allFlippers.map((feed) => (
          <TableRow
            key={feed.id}
            feed={feed}
            updateTopic={updateTopic}
            updateName={updateName}
          />
        ))}
      </tbody>
    </StyledTable>
  )
}

const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;

  th,
  td {
    text-align: left;

    &:last-child {
      width: 32px;
    }
  }

  td {
    padding: 8px 8px;

    &:last-child {
      cursor: pointer;
    }

    input {
      width: 100%;
    }

    select {
      width: 100%;
    }
  }

  thead th {
    padding: 4px 8px;
    font-size: inherit;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  tbody {
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`
