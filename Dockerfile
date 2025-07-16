FROM node:22-alpine AS base
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
RUN pnpm install --prod
ENV PORT=3000
EXPOSE 3000
COPY --from=front-end /app/build /app/public
COPY --from=back-end /app/dist /app/dist
CMD ["node", "dist/app.js"]

