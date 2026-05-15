require('dotenv').config();
const aiService = require('../src/services/ai.service');

(async () => {
  try {
    console.log('Test 1: greeting to other');
    const res1 = await aiService.generateAiResult('halo rafi', 'test-user');
    console.log(JSON.stringify(res1, null, 2));
  } catch (e) {
    console.error('Error test1', e.message);
  }

  try {
    console.log('\nTest 2: out of scope general question');
    const res2 = await aiService.generateAiResult('agama mu apa', 'test-user');
    console.log(JSON.stringify(res2, null, 2));
  } catch (e) {
    console.error('Error test2', e.message);
  }

  try {
    console.log('\nTest 3: normalize crossing midnight schedulePlan');
    const { normalizeSchedulePlan } = require('../src/utils/validators');
    const plan = [
      { startTime: '2026-05-17T23:00:00+08:00', endTime: '2026-05-17T01:00:00+08:00', date: '2026-05-17T00:00:00+08:00' }
    ];
    const normalized = normalizeSchedulePlan(plan);
    console.log(JSON.stringify(normalized, null, 2));
  } catch (e) {
    console.error('Error test3', e.message);
  }
})();