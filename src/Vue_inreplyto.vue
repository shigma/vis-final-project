<script>
const IRT = require('../dist/inreplytoTable.json');
module.exports = {
    data: () => ({
        SelectMailID: 2,
        SVGWidth: 300,
        SVGHeight: 100,
        circle: false,
        activeId: 2,
    }),
    methods: {
        SelectedMailID(){
            let ret = this.SelectMailID;
            return ret;
        },
        ParentMailID(){
            let ret = IRT[this.SelectMailID].p;
            return ret;
        },
        InReplyToMailID(){
            let ret = IRT[this.SelectMailID].irt_id;
            return ret;
        },
        Text(id){
            return id===-1 ? 'NULL' : 'ID = ' + id;
        },
        CircleCheck(index, activeId){
            if (index===activeId){
                '';
            } else if (index+1===activeId||index-4===activeId){     // Pred
                let ret = this.InReplyToMailID();
                if (ret !== -1){
                    this.SelectMailID = ret;
                    this.activeId = index;
                }
            } else if (index-1===activeId||index+4===activeId){     // Succ
                let ret = this.ParentMailID();
                if (ret !== -1){
                    this.SelectMailID = ret;
                    this.activeId = index;
                }
            }
        }
    },
}
</script>

<template>
    <div>
        <h3>in reply to ref</h3>
        <svg :width = "SVGWidth+100" :height = "SVGHeight">
            <circle v-for="index in [0,1,2,3,4]" :key="index"
                :cx = "SVGWidth*(2*((index-activeId+7)%5)-1)/6" :cy = "SVGHeight/2" 
                :r = "activeId===index?SVGHeight*0.4:SVGHeight*0.30"
                @click="CircleCheck(index, activeId)"
                :class="{
                    selected: index===activeId,
                    pred: index+1===activeId||index-4===activeId,
                    succ: index-1===activeId||index+4===activeId,
                }"/>
            <text :x = "SVGWidth*9/12" :y = "SVGHeight/2" :textLength = "SVGWidth/6" lengthAdjust = "spacing"> {{ Text(ParentMailID()) }} </text>
            <text :x = "SVGWidth*5/12" :y = "SVGHeight/2" :textLength = "SVGWidth/6" lengthAdjust = "spacing"> {{ Text(SelectedMailID()) }} </text>
            <text :x = "SVGWidth*1/12" :y = "SVGHeight/2" :textLength = "SVGWidth/6" lengthAdjust = "spacing"> {{ Text(InReplyToMailID()) }} </text>
        </svg>
    </div>
</template>
    
<style lang="scss" scoped>

circle {
    fill: #ff0000;
    stroke: #000000;
    stroke-width: 2;
    opacity: 1;
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


