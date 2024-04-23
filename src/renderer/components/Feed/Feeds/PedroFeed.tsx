
import { styled, css } from '@/renderer/globalStyles/styled';
import React, { FC } from 'react';

const StyledVideo = styled.video`
  height: 100%;
  width: 100%;
  object-fit: contain;
  overflow: hidden;
  background: black;`

export const PedroFeed: FC = ()=>{
    return <StyledVideo src="assets/PedroPedroPedro.mp4" autoPlay loop></StyledVideo>
}
