
<script>
/**
 * @file KeywordCloud.vue
 *
 * @brief The component that visualize a word cloud
 * Each item in the prop data must have name and value field
 *
 * @author He, Hao
 * @since 2019-01-07
 */

const eventBus = require("../src/EventBus.js");
const echarts = require("echarts");
require("echarts-wordcloud");

module.exports = {
    props: {
        data: {
            required: true,
            type: Object
        },
        tag: {
            type: String
        }
    },
    data: () => ({}),
    mounted: function() {
        this.setEchart();
    },
    watch: {
        data: function(newData, oldData) {
            this.setEchart();
        }
    },
    computed: {},
    methods: {
        setEchart() {
            let originalData = Array.from(this.data);
            let dom = this.$refs.keywordcloud;
            let chart = echarts.init(dom);
            chart.off("click");
            chart.on("click", params => {
                // Emit different type of event according to tag
                if (params.componentType === "series") {
                    if (this.tag.includes("keyword")) {
                        let keyword = params.data.name;
                        eventBus.$emit("keyword-changed", {
                            keyword: keyword,
                            tag: this.tag
                        });
                    } else if (this.tag.includes("user")) {
                        eventBus.$emit("user-changed", {
                            userId: params.data.id,
                            tag: this.tag
                        });
                    }
                }
            });
            let obj = {
                grid: {
                    top: '20%',
                    bottom: '10%',
                },
                series: [
                    {
                        type: "wordCloud",

                        // The shape of the "cloud" to draw. Can be any polar equation represented as a
                        // callback function, or a keyword present. Available presents are circle (default),
                        // cardioid (apple or heart shape curve, the most known polar equation), diamond (
                        // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

                        shape: "diamond",

                        // A silhouette image which the white area will be excluded from drawing texts.
                        // The shape option will continue to apply as the shape of the cloud to grow.

                        //maskImage: maskImage,

                        // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
                        // Default to be put in the center and has 75% x 80% size.
                        left: "center",
                        top: "center",
                        width: "80%",
                        height: "90%",
                        right: null,
                        bottom: null,

                        // Text size range which the value in data will be mapped to.
                        // Default to have minimum 12px and maximum 60px size.

                        sizeRange: [12, 60],

                        // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

                        rotationRange: [-0, 0],
                        rotationStep: 45,

                        // size of the grid in pixels for marking the availability of the canvas
                        // the larger the grid size, the bigger the gap between words.

                        gridSize: 6,

                        // set to true to allow word being draw partly outside of the canvas.
                        // Allow word bigger than the size of the canvas to be drawn
                        drawOutOfBound: false,

                        // Global text style
                        textStyle: {
                            normal: {
                                fontFamily: "sans-serif",
                                fontWeight: "bold",
                                // Color can be a callback function or a color string
                                color: function() {
                                    // Random color
                                    return (
                                        "rgb(" +
                                        [
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160),
                                            Math.round(Math.random() * 160)
                                        ].join(",") +
                                        ")"
                                    );
                                }
                            },
                            emphasis: {
                                shadowBlur: 10,
                                shadowColor: "#333"
                            }
                        },

                        // Data is an array. Each array item must have name and value property.
                        data: originalData
                    }
                ]
            };
            chart.setOption(obj);
        }
    }
};
</script>

<template>
    <div id="wordcloud" ref="keywordcloud"></div>
</template>

<style lang="scss" scoped>
#wordcloud {
    will-change: transform;
}
</style>

