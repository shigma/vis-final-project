<script>
/**
 * A component that visualizes a set of data into a bubble cloud
 * The data prop should have data.name and data.value field.
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
        chart: {},
        width: 400,
        height: 400
    }),
    computed: {
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
    },
    mounted: function() {
        console.log(this.tree.leaves());

        const svg = d3.select(this.$refs.userCloud).append("svg");

        const leaf = svg
            .selectAll("g")
            .data(this.tree.leaves())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

        leaf.append("circle")
            .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
            .attr("r", d => d.r)
            .attr("fill-opacity", 0.7)
            .attr("fill", d => color(d.data.group));

        leaf.append("clipPath")
            .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
            .append("use")
            .attr("xlink:href", d => d.leafUid.href);

        leaf.append("text")
            .attr("clip-path", d => d.clipUid)
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter()
            .append("tspan")
            .attr("x", 0)
            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
            .text(d => d);

        leaf.append("title").text(d => `${d.data.title}\n${format(d.value)}`);

        this.chart = svg.node();
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
                <text>{{node.data.name}}</text>
            </g>
        </svg>
    </div>
</template>

<style lang="scss" scoped>
.svg {
    font-size: 1;
    font-family: sans-serif;
    text-anchor: middle;
}
.circle {
    stroke: black;
    stroke-width: 2;
    fill: blue;
}
</style>
