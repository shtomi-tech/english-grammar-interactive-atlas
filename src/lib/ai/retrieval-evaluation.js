import { searchRetrievalIndex } from './retrieval-search.js';

export function evaluateRetrievalBenchmarks(index, benchmarks, search = searchRetrievalIndex) {
  const results = benchmarks.map((benchmark) => {
    try {
      const searchResults = search(index, benchmark.query);
      if (benchmark.expectEmpty) {
        return {
          id: benchmark.id,
          passed: searchResults.length === 0,
          rank: null,
          expectedTopIds: [],
          maxRank: 0,
          actualTopIds: searchResults.map((result) => result.id),
        };
      }
      const expectedTopIds = new Set(benchmark.expectedTopIds);
      const maxRank = benchmark.maxRank ?? 1;
      const matchingResult = searchResults.find((result, index) => expectedTopIds.has(result.id) && index + 1 <= maxRank);
      return {
        id: benchmark.id,
        passed: Boolean(matchingResult),
        rank: matchingResult ? searchResults.findIndex((result) => result.id === matchingResult.id) + 1 : null,
        expectedTopIds: [...benchmark.expectedTopIds],
        maxRank,
        actualTopIds: searchResults.slice(0, maxRank).map((result) => result.id),
      };
    } catch (error) {
      return {
        id: benchmark.id,
        passed: false,
        rank: null,
        expectedTopIds: [...benchmark.expectedTopIds],
        maxRank: benchmark.maxRank ?? 1,
        actualTopIds: [],
        error: error.message,
      };
    }
  });
  const passed = results.filter((result) => result.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}
