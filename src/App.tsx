/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  Layers, 
  ArrowDown, 
  Weight, 
  Droplets, 
  RotateCw, 
  Box,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCcw
} from 'lucide-react';
import Bathtub3D from './components/Bathtub3D';
import { BathtubParams, MaterialType, MATERIAL_DATA } from './types';

export default function App() {
  const [params, setParams] = useState<BathtubParams>({
    length: 180,
    width: 90,
    height: 65,
    wallThickness: 3,
    cylinderDiameter: 80,
    cylinderRotation: 0,
    waterFill: 60,
    materialType: MaterialType.ACRYLIC,
    userWeight: 75,
  });

  const [activeTab, setActiveTab] = useState<'controls' | 'equations'>('controls');
  const [isEquationExpanded, setIsEquationExpanded] = useState(true);

  const results = useMemo(() => {
    const { length, width, height, wallThickness, cylinderDiameter, waterFill, materialType, userWeight } = params;
    
    // Outer volumes (cm^3)
    const rectLength = length - cylinderDiameter;
    const vRectOuter = rectLength * width * height;
    const vCylOuter = Math.PI * Math.pow(cylinderDiameter / 2, 2) * height;
    
    // Inner volumes (cm^3)
    const vRectInner = (rectLength - wallThickness) * (width - wallThickness * 2) * (height - wallThickness);
    const vCylInner = Math.PI * Math.pow(cylinderDiameter / 2 - wallThickness, 2) * (height - wallThickness);
    
    const totalOuterVol = vRectOuter + vCylOuter;
    const totalInnerVol = vRectInner + vCylInner;
    
    const materialVol = totalOuterVol - totalInnerVol;
    const waterVol = totalInnerVol * (waterFill / 100);
    
    const materialDensity = MATERIAL_DATA[materialType].density; // kg/m^3
    const materialMass = (materialVol / 1000000) * materialDensity;
    const waterMass = (waterVol / 1000000) * 1000;
    const totalMass = materialMass + waterMass + userWeight;
    
    const gravityForce = totalMass * 9.81; // Newtons
    
    return {
      materialMass: materialMass.toFixed(2),
      waterMass: waterMass.toFixed(2),
      totalMass: totalMass.toFixed(2),
      gravityForce: gravityForce.toFixed(2),
      materialVol: (materialVol / 1000).toFixed(2), // Liters
      waterVol: (waterVol / 1000).toFixed(2), // Liters
      totalOuterVol: (totalOuterVol / 1000).toFixed(2),
    };
  }, [params]);

  const updateParam = (key: keyof BathtubParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const resetParams = () => {
    setParams({
      length: 180,
      width: 90,
      height: 65,
      wallThickness: 3,
      cylinderDiameter: 80,
      cylinderRotation: 0,
      waterFill: 60,
      materialType: MaterialType.ACRYLIC,
      userWeight: 75,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
            <Box className="text-blue-600" />
            浴缸重力與結構分析 APP
          </h1>
          <p className="text-slate-500">
            針對旋轉入口式浴缸之材質密度、含水量及重力分佈的即時算式工具
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetParams}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCcw size={16} />
            重置參數
          </button>
          <div className="h-10 w-[1px] bg-slate-200 mx-2" />
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Enterprise Edition
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'controls' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Settings2 size={18} />
                調整參數
              </button>
              <button 
                onClick={() => setActiveTab('equations')}
                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'equations' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Info size={18} />
                運算算式
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {activeTab === 'controls' ? (
                <>
                  <div className="space-y-4">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Layers size={16} className="text-blue-500" />
                      主要材料
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(MaterialType).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateParam('materialType', type)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                            params.materialType === type 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {MATERIAL_DATA[type].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">幾何設定</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">總長度 (L)</span>
                        <span className="font-mono font-medium">{params.length} cm</span>
                      </div>
                      <input 
                        type="range" min="150" max="220" step="1"
                        value={params.length}
                        onChange={(e) => updateParam('length', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">寬度 (W)</span>
                        <span className="font-mono font-medium">{params.width} cm</span>
                      </div>
                      <input 
                        type="range" min="70" max="120" step="1"
                        value={params.width}
                        onChange={(e) => updateParam('width', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">壁厚 (t)</span>
                        <span className="font-mono font-medium">{params.wallThickness} cm</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="0.5"
                        value={params.wallThickness}
                        onChange={(e) => updateParam('wallThickness', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">旋轉門直徑 (D)</span>
                        <span className="font-mono font-medium">{params.cylinderDiameter} cm</span>
                      </div>
                      <input 
                        type="range" min="60" max={params.width} step="1"
                        value={params.cylinderDiameter}
                        onChange={(e) => updateParam('cylinderDiameter', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">動態變量</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 flex items-center gap-1"><RotateCw size={14} /> 門旋轉角度</span>
                        <span className="font-mono font-medium">{params.cylinderRotation}°</span>
                      </div>
                      <input 
                        type="range" min="0" max="180" step="1"
                        value={params.cylinderRotation}
                        onChange={(e) => updateParam('cylinderRotation', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 flex items-center gap-1"><Droplets size={14} /> 含水百分比</span>
                        <span className="font-mono font-medium">{params.waterFill}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" step="1"
                        value={params.waterFill}
                        onChange={(e) => updateParam('waterFill', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 flex items-center gap-1"><Weight size={14} /> 使用者體重</span>
                        <span className="font-mono font-medium">{params.userWeight} kg</span>
                      </div>
                      <input 
                        type="range" min="0" max="150" step="1"
                        value={params.userWeight}
                        onChange={(e) => updateParam('userWeight', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-4 font-mono text-sm border border-slate-100 shadow-inner">
                    <div className="space-y-1">
                      <p className="text-blue-600 font-bold">1. 體積計算 (Volume)</p>
                      <p className="text-slate-700">V_total = V_rect + V_cyl</p>
                      <p className="text-slate-500 text-[10px]">V_rect = (L - D) × W × H</p>
                      <p className="text-slate-500 text-[10px]">V_cyl = π × (D/2)² × H</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-blue-600 font-bold">2. 材料質量 (Material Mass)</p>
                      <p className="text-slate-700">M_mat = (V_outer - V_inner) × ρ_mat</p>
                      <p className="text-slate-500 text-[10px]">ρ ({params.materialType}) = {MATERIAL_DATA[params.materialType].density} kg/m³</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-blue-600 font-bold">3. 水體質量 (Water Mass)</p>
                      <p className="text-slate-700">M_water = V_inner × 水位% × 1000</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-blue-600 font-bold">4. 總重力 (Total Force)</p>
                      <p className="text-slate-700 italic">F_g = (M_mat + M_water + M_user) × 9.81</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-xs text-amber-800 leading-relaxed font-medium flex gap-2">
                      <Info size={16} className="shrink-0" />
                      注意：此算式為粗略模擬。設計長度跨距 (Span) 時建議安全係數需大於 2.5，特別是在旋轉門鉸鏈處。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Visualization & Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard 
              label="材料重量" 
              value={`${results.materialMass} kg`} 
              icon={<Layers className="text-blue-500" />}
              subValue={`${results.materialVol} L`}
            />
            <StatsCard 
              label="水體重量" 
              value={`${results.waterMass} kg`} 
              icon={<Droplets className="text-cyan-500" />}
              subValue={`${results.waterVol} L`}
            />
            <StatsCard 
              label="系統總重" 
              value={`${results.totalMass} kg`} 
              icon={<Weight className="text-indigo-500" />}
              subValue="含使用者體重"
            />
            <StatsCard 
              label="垂直重力 (F_g)" 
              value={`${results.gravityForce} N`} 
              icon={<ArrowDown className="text-red-500" />}
              subValue="重力加速度 9.81"
            />
          </div>

          <div className="relative group">
            <div className="absolute top-4 left-4 z-10 space-y-1">
              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                Interactive 3D Viewport
              </div>
            </div>
            <Bathtub3D params={params} />
            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <div className="bg-white/90 backdrop-blur p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] font-medium text-slate-500">
                滑鼠旋轉 • 滾輪縮放
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsEquationExpanded(!isEquationExpanded)}
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                結構受力詳細分析
              </h2>
              {isEquationExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>

            <AnimatePresence>
              {isEquationExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 space-y-8 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">01</span>
                        重力分佈圖解 (Gravity Distribution)
                      </h3>
                      <div className="relative h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-end justify-center p-4">
                        <div className="flex gap-4 items-end w-full max-w-xs">
                          <div className="flex-1 bg-blue-300 rounded-t-lg transition-all duration-500" style={{ height: `${(Number(results.materialMass) / Number(results.totalMass)) * 100}%` }}>
                            <div className="text-[10px] text-center -mt-6 font-bold text-blue-700">材料</div>
                          </div>
                          <div className="flex-1 bg-cyan-400 rounded-t-lg transition-all duration-500" style={{ height: `${(Number(results.waterMass) / Number(results.totalMass)) * 100}%` }}>
                            <div className="text-[10px] text-center -mt-6 font-bold text-cyan-700">水體</div>
                          </div>
                          <div className="flex-1 bg-indigo-400 rounded-t-lg transition-all duration-500" style={{ height: `${(params.userWeight / Number(results.totalMass)) * 100}%` }}>
                            <div className="text-[10px] text-center -mt-6 font-bold text-indigo-700">人物</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        當含水百分比過高且材質為 marble 時，地面單位承壓荷重 (kN/m²) 將顯著增加，需評估建築結構水平負荷。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">02</span>
                        旋轉動力參數 (Rotational Torque)
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-600">旋轉門預估重量</span>
                          <span className="font-bold">~{(Number(results.materialMass) * (params.cylinderDiameter / params.length)).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-600">鉸鏈靜載矩 (τ_static)</span>
                          <span className="font-bold text-blue-600">~{(Number(results.materialMass) * (params.cylinderDiameter / params.length) * 9.81 * (params.cylinderDiameter / 200)).toFixed(1)} N·m</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          *假設門軸心位於直徑邊緣，且重心位於直徑中心。
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2026 浴缸重力模擬與結構輔助設計工具 • Google AI Studio Build</p>
      </footer>
    </div>
  );
}

function StatsCard({ label, value, icon, subValue }: { label: string, value: string, icon: React.ReactNode, subValue?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {subValue && <div className="text-xs text-slate-500 font-medium">{subValue}</div>}
      </div>
    </motion.div>
  );
}

