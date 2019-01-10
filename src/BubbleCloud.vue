<script>
/**
 * A component that visualizes a set of data into a bubble cloud
 * The data prop should have data.id, data.name and data.value field.
 *
 * References:
 *     https://beta.observablehq.com/@mbostock/d3-bubble-chart
 *     https://github.com/d3/d3/wiki/包布局
 *     "Visualization of large hierarchical data by circle packing", SIGCHI'06
 *
 * @author He, Hao
 * @since 2019-01-10
 */

const eventBus = require("../src/EventBus.js");
const d3 = require("d3");

module.exports = {
    props: {
        data: {
            required: true,
            type: Object
        }
    },
    data: () => ({
        chart: {}
    }),
    computed: {
        width() {
            return 400;
        },
        height() {
            return 300;
        },
        tree() {
            return this.pack(this.data);
        },
        pack() {
            return data =>
                d3
                    .pack()
                    .size([this.width - 2, this.height - 2])
                    .padding(3)(
                    d3.hierarchy({ children: data }).sum(d => d.value)
                );
        }
    }
};
</script>

<template>
    <div ref="usercloud">
        <svg :width="width" :height="height">
            <g
                v-for="node in tree.leaves()"
                :key="node.data"
                :transform="'translate('+(node.x+1)+','+(node.y+1)+')'"
            >
                <circle :r="node.r"></circle>
                <clipPath :id="'clipPath' + node.data.id">
                    <circle :r="node.r"></circle>
                </clipPath>
                <text :id="'text'+node.data.id">{{node.data.name}}</text>
                <use
                    :clip-path="'url(#clipPath'+node.data.id+')'"
                    :xlink:href="'#text'+node.data.id"
                ></use>
            </g>
        </svg>
    </div>
</template>

<style lang="scss" scoped>
svg {
    font-size: 10px;
    font-family: sans-serif;
    text-anchor: middle;
}
circle {
    stroke: black;
    stroke-width: 1;
    fill: red;
    opacity: 1;
}
</style>
