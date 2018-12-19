<script>
const IRT = require('../dist/inreplytoTable.json');
module.exports = {
    data: () => ({
        SelectMailID: 2,
        SVGWidth: 300,
        SVGHeight: 100,
        circle: false,
        activeId: 1,
    }),
    methods: {
        MainMail(){
            return this.SelectMailID;
        },
        ParentMailID(){
            return IRT[this.SelectMailID].p;
        },
        InReplyToMailID(){
            return IRT[this.SelectMailID].irt_id;
        },
    },
}
</script>

<template>
    <div>
        <h3>in reply to ref</h3>
        <svg :width = "SVGWidth+100" :height = "SVGHeight">
            <circle v-for="index in [0,1,2,3,4]" :key="index"
                :cx = "SVGWidth*(2*((index-activeId+7)%5)-1)/6" :cy = "SVGHeight/2" 
                :r = "activeId===index?SVGHeight*0.4:SVGHeight*0.25"
                @click="activeId = index"
                :class="{
                    selected: index===activeId,
                    pred: index+1===activeId||index-4===activeId,
                    succ: index-1===activeId||index+4===activeId,
                }"/>
        </svg>
    </div>
</template>
    
<style lang="scss" scoped>

circle {
    fill: #ff0000;
    stroke: #000000;
    stroke-width: 2;
    opacity: 0;
    transition: 0.3s ease;
    &.selected, {
        opacity: 1;
        fill: darkorange;
    }
    &.pred {
        opacity: 1;
        fill: yellow;
    }
    &.succ {
        opacity: 1;
        fill: violet;
    }
}

</style>


