module.exports = {
  apps: [
    {
      name: "hostidmurah-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/hostidmurah-web",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
