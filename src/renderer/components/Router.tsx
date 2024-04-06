import React, { FC } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Teleop } from '@/renderer/components/pages/Teleop';
import { Victim } from '@/renderer/components/pages/Victim';
import { Debug } from '@/renderer/components/pages/Debug';
import { ConfigPage } from '@/renderer/components/pages/Config/ConfigPage';
export const Router: FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/teleop" />} />
        <Route path="/teleop" element={<Teleop />} />
        <Route path="/victim" element={<Victim />} />
        <Route path="/config/*" element={<ConfigPage />} />
        <Route path="/debug" element={<Debug />} />
      </Routes>
    </>
  );
};
