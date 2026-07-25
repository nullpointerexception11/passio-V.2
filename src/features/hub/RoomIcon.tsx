/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PenTool, BookOpen, Archive, Settings } from 'lucide-react';
import { IRoom, RoomHubService } from '../../core/hub/RoomHubService';

interface RoomIconProps {
  room: IRoom;
  radius: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export const RoomIcon: React.FC<RoomIconProps> = ({
  room,
  radius,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const { x, y } = RoomHubService.getCoordinates(room.angle, radius);

  const renderIcon = () => {
    const iconProps = { className: 'w-9 h-9 stroke-[1.5] transition-colors duration-150' };
    switch (room.iconName) {
      case 'pen':
        return <PenTool {...iconProps} />;
      case 'book':
        return <BookOpen {...iconProps} />;
      case 'archive':
        return <Archive {...iconProps} />;
      case 'settings':
        return <Settings {...iconProps} />;
      default:
        return <PenTool {...iconProps} />;
    }
  };

  return (
    <button
      id={`passio-room-icon-${room.id}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center cursor-pointer border select-none transition-all duration-300 shadow-sm hover:shadow-xl group"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${isHovered ? 1.08 : 1})`,
        backgroundColor: isHovered ? 'var(--color-text-primary)' : 'var(--color-bg-surface)',
        borderColor: isHovered ? 'var(--color-text-primary)' : 'var(--color-border-subtle)',
        color: isHovered ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
      }}
    >
      <div className="flex items-center justify-center mb-1">
        {renderIcon()}
      </div>
      <span className="text-[11px] font-serif font-medium tracking-wider uppercase mt-1">
        {room.title}
      </span>
    </button>
  );
};

export default RoomIcon;
