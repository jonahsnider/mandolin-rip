# mandolin-rip

[![Build Status](https://github.com/jonahsnider/mandolin-rip/workflows/CI/badge.svg)](https://github.com/jonahsnidersnider/mandolin-rip/actions)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![codecov](https://codecov.io/gh/jonahsnider/mandolin-rip/branch/main/graph/badge.svg)](https://codecov.io/jonahsnidersnider/mandolin-rip)

mandolin-rip will download `.ts` video files from the Mandolin streaming platform.

## Usage

1. Add your token to `src/config.json` and update the streams to download.
2. `yarn`
3. `yarn build`
4. `yarn start`

Files will be downloaded into the `downloads` directory, grouped by stream UUID.

After everything has been downloaded you can stitch the clips together using FFmpeg:

```sh
yarn stitch
```

This will output an `mp4` file for each stream in the `stitched` directory.
