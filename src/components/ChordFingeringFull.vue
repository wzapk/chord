/* SPDX-License-Identifier: GPL-3.0-only */ /* Copyright 2019 Adam Jagosz.
https://github.com/hyvyys/chordline */

<template>
  <div>
    <v-card>
      <v-card-text @click="$emit('play')">
        <ChordDiagram
          :chord="chordFingering"
          :tuning="tuning"
          :tuningPosition="-1"
          :openMutedPosition="2"
          :displayTuning="true"
          :displayOpenStrings="true"
        ></ChordDiagram>
      </v-card-text>
      <v-card-actions>
        {{ chordFingering.debug }}
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import ChordDiagram from "./ChordDiagram.vue";
export default {
  components: {
    ChordDiagram
  },
  props: {
    chordSymbol: { type: String, required: true },
    chordFingering: { type: Object, required: true },
    tuning: { type: Object, default: () => ({ label: "EADGBe", value: "" }) }
  },
  computed: {
    definitionString() {
      return (
        this.chordSymbol.padEnd(12, " ") + this.chordFingering.positionString
      );
    }
  }
};
</script>

<style lang="scss" scoped>
$icon-size: 24px;
$accent: #9a4a9c;
$accent: #46acff;

$dark-background: #261627;
// $dark-lighter: #3d213f;
// $dark-medium: #582a5a;
$dark-lighter: #2a213f;
$dark-medium: #404575;
$dark-neutral: #3c3057;

$dark-hover: #3162ac;
$dark-active: $accent;
$dark-lighter-active: #27285c;

// $dark-hover: #b44775;
// $dark-active: #b46647;

$dark-text: #eee;
$dark-text-subtle: #a2b6c9;

// $home-background: #f5ded4;
$home-background: #e4ecf7;
$home-background: #f5eff7;

// $light-background: #fcf0ff;
$light-background: #f5eff7;
$light-hover: #edddff;
$text: #262938;
$text-lighter: #555b75;
$text-subtle: #91a1af;

$light-link: #ad726a;
$light-link: #3c78e7;
$light-link-hover: #f85e37;
$link-underline1: #f72e4f;
$link-underline2: #f38123;
$light-link-hover: #46acff;
$link-underline1: #4790ff;
$link-underline2: #23f3ae;

$dark-link-hover: #ff841f;
$dark-link-hover: #89caff;
$dark-link-underline1: $link-underline1;
$dark-link-underline2: $link-underline2;
$dark-link-underline1: #2e7ef7;
$dark-link-underline2: #23f3ae;

$light-shadow: #2c2c3088;
$light-border: #c0bdd4;

// KeenUi
$font-stack: "Nunito Sans", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

$brand-primary-color: $accent;
$brand-accent-color: $accent;

// Monaco
$shade-color: #e8e8e8;
$shade-color-darker: #ccc;

$chord: #237893; // monaco line numbers too
$song-part: #925c38;
$song-part: #778285;
$editorInactiveSelection: #c0bdd4;

@mixin shiny-glass() {
  $c: rgba($accent, 0.25);
  $w: rgba(white, 1);
  background-image: radial-gradient($c, $w);
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: no-repeat 30% 80% / 300% 300% rgba($light-background, 0.1);
    $t: rgba(white, 0);
    $c: rgba(white, 0.45);
    $w: rgba(white, 1);
    background-image: radial-gradient($t 40%, $c 40.5%, $w 80%);
  }
}

.chord-fingering-full {
  overflow: hidden;

  display: flex;
  flex-direction: column;
  border-radius: 10px;

  .ui-button {
    border-radius: 0;
    border-radius: 1px;
    text-transform: none;
    font-weight: normal;
    min-width: unset;
    padding: 0 0.2rem;

    padding: 0;
    background: 0 100% / 200% 200%;
    background-color: rgba($light-background, 0.1);

    &:hover {
      background-color: rgba($accent, 0.1);
    }

    ::v-deep .ui-ripple-ink__ink {
      background-color: $accent;
    }
  }

  &:hover {
    box-shadow: 0 1px 6px $light-shadow;
    z-index: 1;
    .ui-button {
      @include shiny-glass();
    }
  }
}

.fingering {
  max-height: unset;
  height: unset;
}
.chord-diagram {
  margin-top: 0.25em;
  font-size: 1rem;
  width: 10em;
  pointer-events: none;
}

.copy-button {
  height: 2rem;

  ::v-deep .ui-button__content {
    display: flex;
    flex: 1;
    width: 100%;
    padding: 0 0.25rem;
    svg {
      flex: 0 0 32px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    color: $text-subtle;
    &:hover {
      color: $text;
    }

    .position-string {
      display: block;
      flex: 1;
      align-self: flex-end;
      margin: 0 1em 0 0;
      padding-right: 0.5rem;
      font-size: 0.8rem;
      white-space: nowrap;
      text-align: center;
    }
  }
}

.chord-fingering-full:hover {
  .copy-button ::v-deep .ui-button__content svg {
    opacity: 1;
  }
}
</style>
