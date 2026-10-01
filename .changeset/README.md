# Changesets

변경이 있는 PR에는 `pnpm exec changeset`으로 변경 내역을 추가합니다. 배포는 패키지의 `private`을 해제한 뒤 `pnpm exec changeset version` → `pnpm -r publish` 순서로 합니다.
