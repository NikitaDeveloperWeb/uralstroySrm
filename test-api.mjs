async function test() {
  const res = await fetch('/api/salary-reports');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}

test().catch(console.error);
