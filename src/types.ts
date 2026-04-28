/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BathtubParams {
  length: number;
  width: number;
  height: number;
  wallThickness: number;
  cylinderDiameter: number;
  cylinderRotation: number;
  waterFill: number;
  materialType: MaterialType;
  userWeight: number;
}

export enum MaterialType {
  ACRYLIC = 'Acrylic',
  MARBLE = 'Marble',
  CAST_IRON = 'Cast Iron',
  WOOD = 'Wood'
}

export const MATERIAL_DATA = {
  [MaterialType.ACRYLIC]: { density: 1180, color: '#e0f2fe', label: '壓克力' },
  [MaterialType.MARBLE]: { density: 2700, color: '#f5f5f4', label: '大理石' },
  [MaterialType.CAST_IRON]: { density: 7200, color: '#444444', label: '鑄鐵' },
  [MaterialType.WOOD]: { density: 500, color: '#92400e', label: '木質 (紅松)' },
};
