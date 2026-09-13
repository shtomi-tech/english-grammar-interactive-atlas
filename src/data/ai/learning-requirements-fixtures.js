export const learningRequirementsFixtures = Object.freeze([
  {
    version: '1',
    id: 'LR-001',
    topic: 'infinitives',
    sourceReferences: [
      { id: 'SOURCE-001', type: 'user-provided', title: '不定詞 解説資料' },
    ],
    audience: { stage: 'high-school' },
    constraints: { durationMinutes: 15, language: 'ja' },
    learningPoints: [
      {
        id: 'LP-001',
        concept: 'to + base verb',
        summary: '不定詞はtoの後ろに動詞原形を置く。',
        importance: 'core',
        desiredOutcomes: ['recognize-form', 'produce-form'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-001',
            locator: { section: '不定詞の基本形' },
            summary: 'toの後ろには動詞原形を置くと説明されている。',
          },
        ],
      },
      {
        id: 'LP-002',
        concept: 'noun-like function',
        summary: '不定詞は名詞のように働くことがある。',
        importance: 'core',
        desiredOutcomes: ['identify-role', 'understand-rule'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-001',
            locator: { section: '不定詞の働き' },
            summary: '不定詞が文中で名詞相当の役割を持つ例が示されている。',
          },
        ],
      },
      {
        id: 'LP-003',
        concept: 'purpose',
        summary: '不定詞は目的を表す副詞的な働きも持つ。',
        importance: 'supporting',
        desiredOutcomes: ['understand-meaning', 'apply-rule'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-001',
            locator: { heading: '目的を表す不定詞' },
            summary: '不定詞で行動の目的を表す使い方が説明されている。',
          },
        ],
      },
    ],
  },
  {
    version: '1',
    id: 'LR-002',
    topic: 'gerunds',
    sourceReferences: [
      { id: 'SOURCE-002', type: 'user-provided', title: '動名詞 解説資料' },
    ],
    audience: { stage: 'high-school' },
    constraints: { durationMinutes: 15, language: 'ja' },
    learningPoints: [
      {
        id: 'LP-101',
        concept: 'verb + ing',
        summary: '動名詞は動詞にingを付けた形を使う。',
        importance: 'core',
        desiredOutcomes: ['recognize-form', 'produce-form'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-002',
            locator: { section: '動名詞の形' },
            summary: '動詞にingを付ける動名詞の形が説明されている。',
          },
        ],
      },
      {
        id: 'LP-102',
        concept: 'noun-like function',
        summary: '動名詞は名詞のように主語や目的語になれる。',
        importance: 'core',
        desiredOutcomes: ['identify-role', 'classify-function'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-002',
            locator: { paragraph: 2 },
            summary: '動名詞が主語や目的語になる例が示されている。',
          },
        ],
      },
      {
        id: 'LP-103',
        concept: 'enjoy + gerund',
        summary: 'enjoyの後ろでは動名詞を使う。',
        importance: 'supporting',
        desiredOutcomes: ['choose-in-context', 'explain-choice'],
        sourceEvidence: [
          {
            sourceId: 'SOURCE-002',
            locator: { heading: 'enjoyの後ろの形' },
            summary: 'enjoyの目的語に動名詞を置くパターンが説明されている。',
          },
        ],
      },
    ],
  },
]);
