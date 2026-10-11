import { defineRailway, github, preserve, project, service } from "railway/iac";

function gitBranch(environment: string | undefined): string {
  if (environment === "production") return "main";
  if (environment === "staging") return "staging";
  throw new Error(`No git branch configured for Railway environment ${environment ?? "(missing)"}`);
}

export default defineRailway((ctx) => {
  const branch = gitBranch(ctx.environment);

  const backend = service("backend", {
    source: github("dhuy21/CryptInsa", { branch, checkSuites: true, rootDirectory: "/backend" }),
    healthcheck: "/health",
    healthcheckTimeout: 300,
    replicas: { "europe-west4-drams3a": 1 },
    env: { DJANGO_SECRET_KEY: preserve(), PORT: preserve() },
  });
  const frontend = service("frontend", {
    source: github("dhuy21/CryptInsa", { branch, checkSuites: true, rootDirectory: "/frontend-react" }),
    healthcheck: "/",
    healthcheckTimeout: 300,
    replicas: { "europe-west4-drams3a": 1 },
    env: { PORT: preserve() },
  });
  const proxy = service("proxy", {
    source: github("dhuy21/CryptInsa", { branch, checkSuites: true, rootDirectory: "/nginx" }),
    healthcheck: "/api/health",
    healthcheckTimeout: 300,
    replicas: { "europe-west4-drams3a": 1 },
    env: {
      BACKEND_UPSTREAM: preserve(),
      FRONTEND_UPSTREAM: preserve(),
      NGINX_RESOLVER: preserve(),
      NGINX_RESOLVER_IPV6: preserve(),
      NGINX_RESOLVER_VALID: preserve(),
      PORT: preserve(),
    },
  });

  return project("CryptInsa", {
    variables: { managed: true },
    resources: [backend, frontend, proxy],
  });
});
