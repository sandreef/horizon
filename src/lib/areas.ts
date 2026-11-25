export const AREAS = [
  {
    id: 'ai',
    name: 'Advanced AI',
    blurb: 'Models, training, agents, evaluation, and the papers behind them.',
  },
  {
    id: 'programming',
    name: 'Programming',
    blurb: 'Languages, tools, testing, and the craft of writing good code.',
  },
  {
    id: 'system-design',
    name: 'System design',
    blurb: 'Architecture, distributed systems, performance, and trade-offs.',
  },
  {
    id: 'science-tech',
    name: 'Science & tech',
    blurb: 'Developments in science and technology worth understanding.',
  },
] as const;

export type AreaId = (typeof AREAS)[number]['id'];
export const AREA_IDS = AREAS.map((a) => a.id) as [AreaId, ...AreaId[]];

export function areaById(id: string) {
  return AREAS.find((a) => a.id === id);
}
