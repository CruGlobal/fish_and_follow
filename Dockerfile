# NODE_VERSION set by build.sh based on .tool-versions file
ARG NODE_VERSION=lts
FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS front-end
COPY ./fish-and-follow-client/package* /app
RUN pnpm install
COPY ./fish-and-follow-client /app
RUN pnpm run build

FROM base AS back-end-base
COPY ./fish-and-follow-server/package* /app

FROM back-end-base AS back-end
RUN pnpm install
COPY ./fish-and-follow-server /app
RUN pnpm run build

FROM back-end-base AS final
LABEL "com.datadoghq.ad.logs"='[{"source": "node", "service": "fish-and-follow", "log_processing_rules": [{"type": "exclude_at_match", "name": "exclude_heath_checks", "pattern": "/healthcheck"}]}]'
RUN pnpm install --prod
ENV PORT=3000
EXPOSE 3000
COPY --from=front-end /app/build /app/public
COPY --from=back-end /app/dist /app/dist
CMD ["node", "dist/app.js"]

