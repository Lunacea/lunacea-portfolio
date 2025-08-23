'use client';
import React from 'react';
import BusinessCard from '@/features/businessCard/components/BusinessCard';
import { Draggable } from '@/shared/components/ui/Draggable';

export default function DraggableBusinessCard() {
  return (
    <div className="mb-16 flex justify-center">
      <Draggable
        className="bg-card/90 backdrop-blur-sm border border-border/30 rounded-2xl p-8 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        ariaLabel="ドラッグ可能な名刺"
      >
        <BusinessCard />
      </Draggable>
    </div>
  );
}
