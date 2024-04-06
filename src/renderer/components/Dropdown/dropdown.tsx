import React from 'react';
import { toast } from 'react-toastify';
import { Robot, robotSlice,selectRobot } from '@/renderer/store/modules/robot';
import { launchFilesSlice,selectAllLaunchFiles } from '@/renderer/store/modules/launchFiles';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { GlobalState } from '@/renderer/store/store';


const StyledSelect = styled.select`
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
font-size: 16px;
color: white;
border: none;
background-color: #404040;
`;
 

function DropdownRobot(){
    const dispatch = useDispatch();
    
    const robot: Robot[] = [
        {
            name:"rove",
        },
        {
            name:"markhor",
        },
    ];
    const handleRobotChange =(event: React.ChangeEvent<HTMLSelectElement>)=>{
        const selectedRobot = event.target.value;
        dispatch(robotSlice.actions.toggleRobot(selectedRobot));
        dispatch(launchFilesSlice.actions.changeRobot(selectedRobot));
        toast.info("robot changed to "+ selectedRobot)
    };
  return (
    
    <StyledSelect onChange={handleRobotChange}>
        {robot.map((robot) => (
            <option value={robot.name}>{robot.name}</option>
          ))}
    </StyledSelect>

  );
}

export default DropdownRobot;