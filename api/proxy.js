export const config = {
  runtime: 'edge',
  regions: ['hkg1'], // 强制使用香港节点，完美避开美国 IP
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return new Response(JSON.stringify({ error: "Missing path parameter" }), { status: 400 });
  }

  // 这里的目标是币安官方 API
  const targetUrl = `https://api.binance.com${decodeURIComponent(path)}`;

  // 复制原始请求的 Headers (包含 API Key)
  const headers = new Headers(req.headers);
  headers.set('Host', 'api.binance.com');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' ? await req.text() : undefined,
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
