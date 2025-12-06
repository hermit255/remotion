# ずんだもん動画量産システム
## 概要
- 事前準備した会話データjsonと音声を投入することでずんだもん動画が作れるシステム
  - 別途n8nで台本データ投入から両者を得られるワークフローを組んである
- データ投入によって動画尺や字幕の調整は自動的に行えるようにした
- 現時点ではずんだもん・めたんが両サイドに立ち、話者を明るく表示する簡素な演出のみ
- 将来的には差分画像やlip sync(口パク)をはじめとしたアニメーションも実装したい

# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
