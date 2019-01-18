<script>

module.exports = {
    props: ['mails', 'startDate', 'endDate'],
}

</script>

<template>
    <div class="mail-list">
        <div v-for="(mail, index) in mails" :key="index">{{ mail }}</div>
    </div>
</template>

<style lang="scss">

.mail-list {
    overflow-x: hidden;
    overflow-y: scroll;
}

</style>
