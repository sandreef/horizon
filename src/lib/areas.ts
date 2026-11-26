// The four areas every note belongs to. The id is used in note headers (area: ai)
// and in addresses (/horizon/ai/). The name and blurb are what the site shows.
export const AREAS = [
  {
    id: 'ai',
    name: 'Advanced AI',
    short: 'AI',
    blurb: 'Models, agents, evaluation, and new ways of working with AI.',
    icon: 'spark',
  },
  {
    id: 'programming',
    name: 'Programming',
    short: 'Code',
    blurb: 'C++ and the craft of writing correct, fast, readable code.',
    icon: 'code',
  },
  {
    id: 'system-design',
    name: 'System design',
    short: 'Systems',
    blurb: 'Architecture, distributed systems, performance, and trade-offs.',
    icon: 'layers',
  },
  {
    id: 'science-tech',
    name: 'Math & science',
    short: 'Science',
    blurb: 'The math behind the machines, and developments in science and engineering.',
    icon: 'orbit',
  },
] as const;

export type Area = (typeof AREAS)[number];
export type AreaId = Area['id'];
export const AREA_IDS = AREAS.map((a) => a.id) as [AreaId, ...AreaId[]];

export function areaById(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
