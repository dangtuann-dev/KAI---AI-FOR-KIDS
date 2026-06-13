// components/exercises/diagrams/DIAGRAM_LIBRARY.ts
import { PlantPartsDiagram } from './PlantPartsDiagram';
import { WaterCycleDiagram } from './WaterCycleDiagram';
import { DigestiveSystemDiagram } from './DigestiveSystemDiagram';

export const DIAGRAM_LIBRARY: Record<string, React.ComponentType<any>> = {
  plant_parts: PlantPartsDiagram,
  water_cycle: WaterCycleDiagram,
  digestive_system: DigestiveSystemDiagram,
};
