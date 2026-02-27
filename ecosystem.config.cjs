module.exports = {
  apps: [
    {
      name: "itemeditor",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3100,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "itemeditor-ws",
      script: "ws-server.ts",
      interpreter: "node_modules/.bin/tsx",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        WS_PORT: 3101,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
  ],
};
