import type { Character } from './types';

/**
 * Minimal but rule-complete fixture. NOT real game data (that's verified in
 * Step 3) — just enough distinct shapes to test every branch:
 *  - Chrom: gen-1 male who fixes a child (Lucina) — the rare male case.
 *  - Olivia: gen-1 female who fixes a child (Inigo).
 *  - Sumia: gen-1 female who fixes a child (Cynthia).
 *  - Frederick: gen-1 male who fixes NO child.
 *  - robin_m: gen-1 male, fixes Morgan-equivalent (here morgan_f stub omitted
 *    for brevity; not needed for these tests).
 *  - Lucina/Inigo/Cynthia: gen-2 children with fixedParentId set.
 *
 * Marriage links are intentionally symmetric and opposite-gender, matching the
 * validator's expectations.
 */

export const TEST_CHARACTERS: Character[] = [
  {
    id: 'chrom',
    name: 'Chrom',
    epithet: 'The Exalt',
    gender: 'male',
    generation: 1,
    source: 'base',
    defaultClass: 'Lord',
    availableClasses: ['Lord', 'Great Lord', 'Cavalier', 'Archer'],
    personality: 'Earnest prince of Ylisse.',
    recruitment: 'Prologue.',
    marriageableWith: ['olivia', 'sumia'],
    tags: ['royalty', 'lord'],
  },
  {
    id: 'olivia',
    name: 'Olivia',
    epithet: 'The Dancer',
    gender: 'female',
    generation: 1,
    source: 'base',
    defaultClass: 'Dancer',
    availableClasses: ['Dancer'],
    personality: 'Shy travelling dancer.',
    recruitment: 'Chapter 11.',
    marriageableWith: ['chrom', 'frederick'],
    tags: ['dancer'],
  },
  {
    id: 'sumia',
    name: 'Sumia',
    epithet: 'The Klutz',
    gender: 'female',
    generation: 1,
    source: 'base',
    defaultClass: 'Pegasus Knight',
    availableClasses: ['Pegasus Knight', 'Cleric', 'Knight'],
    personality: 'Clumsy but devoted pegasus knight.',
    recruitment: 'Chapter 1.',
    marriageableWith: ['chrom', 'frederick'],
    tags: ['flier'],
  },
  {
    id: 'frederick',
    name: 'Frederick',
    epithet: 'The Steadfast',
    gender: 'male',
    generation: 1,
    source: 'base',
    defaultClass: 'Great Knight',
    availableClasses: ['Great Knight', 'Paladin'],
    personality: 'Dutiful knight devoted to the royal family.',
    recruitment: 'Prologue.',
    marriageableWith: ['olivia', 'sumia'],
    tags: ['mounted'],
  },
];

export const TEST_CHILDREN: Character[] = [
  {
    id: 'lucina',
    name: 'Lucina',
    epithet: 'The Future Past',
    gender: 'female',
    generation: 2,
    source: 'base',
    defaultClass: 'Lord',
    availableClasses: ['Lord', 'Great Lord'],
    personality: 'Time-traveller burdened by a ruined future.',
    recruitment: 'Story.',
    marriageableWith: ['inigo'],
    tags: ['royalty', 'lord'],
    notableSkills: ['Aether', 'Charm'],
    fixedParentId: 'chrom',
    inheritanceNotes: 'Always Chrom’s daughter; second class set from mother.',
  },
  {
    id: 'inigo',
    name: 'Inigo',
    epithet: 'The Flower Picker',
    gender: 'male',
    generation: 2,
    source: 'base',
    defaultClass: 'Mercenary',
    availableClasses: ['Mercenary', 'Myrmidon'],
    personality: 'Roguish flirt masking his mother’s shyness.',
    recruitment: 'Paralogue.',
    marriageableWith: ['lucina', 'cynthia'],
    tags: ['mercenary'],
    notableSkills: ['Armsthrift', 'Patience'],
    fixedParentId: 'olivia',
    inheritanceNotes: 'Olivia’s son; father sets his second class set.',
  },
  {
    id: 'cynthia',
    name: 'Cynthia',
    epithet: 'The Hero Chaser',
    gender: 'female',
    generation: 2,
    source: 'base',
    defaultClass: 'Pegasus Knight',
    availableClasses: ['Pegasus Knight', 'Falcon Knight'],
    personality: 'Aspiring hero with a flair for the dramatic.',
    recruitment: 'Paralogue.',
    marriageableWith: ['inigo'],
    tags: ['flier'],
    notableSkills: ['Rally Speed'],
    fixedParentId: 'sumia',
    inheritanceNotes: 'Sumia’s daughter; father sets her second class set.',
  },
];
