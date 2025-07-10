import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ProjectsIconProps {
  size?: number;
  color?: string;
}

export default function ProjectsIcon({ size = 24, color = 'currentColor' }: ProjectsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 19" fill="none">
      <Path
        d="M17.9229 7.95455V5.63636C17.9229 4.78284 17.2341 4.09091 16.3844 4.09091H8.69222L8.21433 2.17062C8.0431 1.48265 7.42775 1 6.72181 1H2.53844C1.68878 1 1 1.69193 1 2.54545V16.4545C1 17.3081 1.68878 18 2.53844 18H10.2307"
        stroke={color}
        stroke-width="1.51"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M10.2308 18H17.491C18.197 18 18.8123 17.5174 18.9836 16.8294L20.9794 8.80949C20.9929 8.75492 20.9999 8.69887 20.9999 8.64261C20.9999 8.26263 20.6932 7.95459 20.3149 7.95459H7.5838C6.87879 7.95459 6.26402 8.43597 6.09191 9.12275L4.83545 14.1364"
        stroke={color}
        stroke-width="1.51"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}
