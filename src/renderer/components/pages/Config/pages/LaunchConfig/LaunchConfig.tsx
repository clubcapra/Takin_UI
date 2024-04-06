import { Button } from '@/renderer/components/common/Button';
import {
  launchFilesSlice,
  selectAllLaunchFiles,
} from '@/renderer/store/modules/launchFiles';
import { rosClient } from '@/renderer/utils/ros/rosClient';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LaunchElement } from './LaunchElement';
import { toast } from 'react-toastify';
import { log } from '@/renderer/logger';
import { FaSync } from 'react-icons/fa';
import { LoadingOverlay } from '@/renderer/components/common/LoadingOverlay';
import { useActor } from '@xstate/react';
import { rosService } from '@/renderer/state/ros';
import { selectRobot } from '@/renderer/store/modules/robot';

interface LaunchMsg {
  fileName: string;
  message: string;
  isLaunched: boolean;
}

interface LaunchedFiles {
  packages: string[];
  fileNames: string[];
}

export const LaunchConfig: FC = () => {
  const dispatch = useDispatch();
  const allLaunchFiles = useSelector(selectAllLaunchFiles);
  const robot= useSelector(selectRobot);
  let launchCommand="";
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState] = useActor(rosService);
  if(robot=="markhor")
  {
    launchCommand='launchHandler/launchFile';
  }
  if(robot=="rove")
  {
    launchCommand='launchHandler/launchFileRos2';
  }

  const onClick = useCallback(
    async (fileName: string, packageName: string) => {
      setIsLoading(true);
      try {
        const result = (await rosClient.callService(
          {
            name: launchCommand,
          },
          { package: packageName, fileName }
        )) as LaunchMsg;
        setIsLoading(false);
        if (result.isLaunched) {
          dispatch(launchFilesSlice.actions.launchFile(result.fileName));
          toast.success(result.message);
        } else {
          dispatch(launchFilesSlice.actions.killFile(result.fileName));
          toast.error(result.message);
        }
      } catch (e) {
        setIsLoading(false);
        log.error(e);
      }
    },
    [dispatch]
  );

  const onClickLaunchAll = useCallback(() => {
    allLaunchFiles.forEach((element) => {
      if (!element.isLaunched) {
        void onClick(element.fileName, element.packageName);
      }
    });
  }, [allLaunchFiles, onClick]);

  const onClickKillAll = useCallback(() => {
    allLaunchFiles.forEach((element) => {
      if (element.isLaunched) {
        void onClick(element.fileName, element.packageName);
      }
    });
  }, [allLaunchFiles, onClick]);

  const refreshLaunchedFiles = useCallback(async () => {
    try {
      const result = (await rosClient.callService({
        name: '/launchHandler/getAllLaunchedFiles',
      })) as LaunchedFiles;
      allLaunchFiles.forEach((element) => {
        const isLaunched = result.fileNames.includes(element.fileName);
        if (isLaunched && !element.isLaunched) {
          dispatch(launchFilesSlice.actions.launchFile(element.fileName));
        } else if (!isLaunched && element.isLaunched) {
          dispatch(launchFilesSlice.actions.killFile(element.fileName));
        }
      });
    } catch (e) {
      log.error(e);
    }
  }, [allLaunchFiles, dispatch]);

  useEffect(() => {
    if (connectionState.matches('connected')) {
      void refreshLaunchedFiles();
    } else {
      allLaunchFiles.forEach((element) => {
        if (element.isLaunched) {
          dispatch(launchFilesSlice.actions.killFile(element.fileName));
        }
      });
    }
  }, [allLaunchFiles, connectionState, dispatch, refreshLaunchedFiles]);

  return (
    <>
      {connectionState.matches('connected') ? (
        <>
          <div style={{ display: 'flex', marginTop: 5 }}>
            <Button onClick={onClickLaunchAll}>Launch All</Button>
            <Button onClick={onClickKillAll}>Kill All</Button>
            <Button onClick={refreshLaunchedFiles}>
              <FaSync />
            </Button>
          </div>
          <>
            {allLaunchFiles.map((element) => (
              <LaunchElement
                key={element.name}
                name={element.name}
                launchFile={element.fileName}
                packageName={element.packageName}
                onClick={onClick}
                isLaunched={element.isLaunched}
              />
            ))}
          </>
          {isLoading ? <LoadingOverlay>Loading...</LoadingOverlay> : ''}
        </>
      ) : (
        <>No connection to ROS</>
      )}
    </>
  );
};
