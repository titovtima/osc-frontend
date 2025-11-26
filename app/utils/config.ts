export const config = {
    // host: '10.1.3.20:8002',
    host: '127.0.0.1:8002',
    maxChannel: 80,
    maxAux: 32,
    consoleType: 'sd'
}

export async function getConfig() {
    if (import.meta.server)
        return await fetch('http://' + config.host + '/config').then(res => res.json()).then(res => {
            config.host = res.backendHost + ":" + res.httpServerPort;
            config.maxChannel = res.maxChannel;
            config.maxAux = res.maxAux;
            config.consoleType = res.console.series;
            return config;
        });
    else
        return await fetch('/config.json').then(res => res.json())
}
