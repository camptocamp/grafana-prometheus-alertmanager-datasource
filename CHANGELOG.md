# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v2.1.0...v2.2.0) (2025-07-01)


### Features

* update grafana plugin tools and support grafana 12 ([6fa4b7d](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/6fa4b7d4bb8d9a655283742f78324d1a92773f48))
* upgrade to node 22 and update dependencies ([150db9c](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/150db9c15c50c8f9ff6797ed6934334e038d9ca3))

## [2.1.0](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v2.0.1...v2.1.0) (2024-09-27)


### Features

* interpolate receiver query param ([#157](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/157)) ([b2eeb6f](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/b2eeb6f61d37580e9af924cf21fceff1e3743c7c))

## [2.0.1](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v2.0.0...v2.0.1) (2024-07-25)


### Bug Fixes

* update dependencies to fix CVEs ([1694ee8](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/1694ee85814f94ca8ea7877b50b38a4c6dc0d60f))


### Miscellaneous Changes

* migrate from grafana/e2e to grafana/plugin-e2e ([1bc1dc7](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/1bc1dc7eb7d0e0e5f570371ee68935cc3650ae3b))

## [2.0.0](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v1.2.1...v2.0.0) (2023-11-06)


### ⚠ BREAKING CHANGES

* rewrite plugin using React plugin framework ([#149](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/149))

### Features

* rewrite plugin using React plugin framework ([#149](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/149)) ([bfcf278](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/bfcf278634ce98108325c31379a9ff03df440151))

## [1.2.1](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v1.2.0...v1.2.1) (2022-06-07)


### Bug Fixes

* Object(...) is not a function error ([da97b6f](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/da97b6f9ecca6577adede99b8619fe9b833e88b0))


### Miscellaneous Changes

* set required grafana version to >= 7.5.0 ([8830627](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/8830627e785791bc5f362d5dafe011e9f2192e65))

## [1.2.0](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/v1.1.0...v1.2.0) (2022-05-17)


### Features

* add numerical severity value on alerts ([#98](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/98)) ([ad98492](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/ad984928626f8e8348a136d17395e76058cca9fa))


### Bug Fixes

* labels and annotations merged only from the first alert ([#118](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/118)) ([a49e90e](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/a49e90e3426738e9d62cda87155c8786cc727325))


### Miscellaneous Changes

* update .gitignore with vscode and build directories ([d350bb1](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/d350bb107ff7d0400c6777e6477c004f05fd5d52))
* upgrade grafana dependencies to v8.5.2 ([2df0340](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/2df0340f88edf57997cc5b01f840b56f4587be69))
* upgrade lodash to v4.17.21 ([913bb00](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/913bb0003507bf2946593106976d33d393bba93e))
* upgrade tslib to v2.4.0 ([913bb00](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/913bb0003507bf2946593106976d33d393bba93e))

## [1.1.0](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/1.0.0...v1.1.0) (2022-05-05)


### Features

* add alertstatus and alertstatus_code fields to data frame ([#101](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/pull/101))
* add doc to configure singlestat panel ([8c51289](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/8c5128940c2baf97ac4118461cb2684170d82a40))
* add github actions for build process ([29a7494](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/29a7494d8ea864545612f1300970f3f80edb4698))
* display active alerts by default ([da31418](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/da31418b3aaf83931466656f1801f093491941b3))
* update tslib dependency ([b420606](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/b4206069fefca48d9c2555e7bb6d50a2de33471f))


### Bug Fixes

* regex escape in filters ([ad8ba67](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/ad8ba678ef80cf6889ca916671cd1bc9acbf43aa))
* revert to original plugin id ([#101](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/pull/101))
* packaging linting errors raised by Grafana plugins check webapp ([#96](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/pull/96))
* build workflow ([b4d72a7](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/b4d72a74782a572d91fc08356185ad65bf010030))
* **ci:** remove package-lock.json ([db32e71](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/db32e712ee1c6151ddbc5be6032e3d198e3e9800))
* **doc:** add missing images ([a26d316](https://www.github.com/camptocamp/grafana-prometheus-alertmanager-datasource/commit/a26d316a3067d72cc615937a683401ad9e0ed247))

## [1.0.0](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/1.0.0...0.0.8) (Feb 12, 2021)


### IMPROVEMENTS

  * Rewrite plugin to match latest dev standards (Typescript, Yarn)
  * Add support of latest Grafana versions

## [0.0.8](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.8...0.0.7) (Apr 22, 2020)


### IMPROVEMENTS

  * Add support of variable templating ([#55](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/pull/55))

### BUGFIX

  * Fix datasource request ([#73](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/pull/73))

## [0.0.7](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.7...0.0.6) (Jan 25, 2019)


### IMPROVEMENTS

  * Allow undefined severity labels ([#44](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/44))
  * Allow usage of multi-values variables ([#40](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/40))

### BUGFIX

  * Fix blank severity column ([#31](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/issues/31))

## [0.0.6](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.6...0.0.5) (May 22, 2018)


### IMPROVEMENTS

  * Use Apache License 2.0
  * Fix severity labels struct (#26)

## [0.0.5](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.5...0.0.4) (May 23, 2018)


### IMPROVEMENTS

  * Display annotations and labels in separate columns
  * Add a selector in query editor to choose the columns to display

## [0.0.4](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.4...0.0.3) (March 29, 2018)


### IMPROVEMENTS

  * Allow manual definition of severity levels
  * Fix templating and add support of All and Multi variables

## [0.0.3](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.3...0.0.2) (December 01, 2017)


### IMPROVEMENTS

  * Add templating support

## [0.0.2](https://github.com/camptocamp/grafana-prometheus-alertmanager-datasource/compare/0.0.2...0.0.1) (December 01, 2017)


### IMPROVEMENTS
  
  * Add support annotations
