<script>

module.exports = {
    props: ['mails', 'startDate', 'endDate'],
    methods: {
        onClick(id) {
            this.$root.setCard('thread', { id: this.dataset.mails[id].threadId })
        },
    }
}

</script>

<template>
    <div class="mail-list">
        <div v-for="(mail, index) in mails" :key="index" @click="onClick(mail)">
            {{ mail }}
        </div>
    </div>
</template>

<style lang="scss">

.mail-list {
    overflow-x: hidden;
    overflow-y: scroll;
}

</style>
