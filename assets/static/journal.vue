<template>
    <span v-if="ready">
        <div v-if="!disclaimer" class="disclaimer">
            <div>
                Эта страница была сделана для удобного просмотра расписания без
                нажимания множества кнопок на сайте СУНЦ. Расписание запрашивается с
                сервера СУНЦ в момент просмотра страницы. Корректность отображения
                будет сверяться какое-то время, на данный момент поручиться могу
                не на 100%, но близко к этому.
            </div>
            <b-button @click="agree">Я понял и согласен</b-button>
        </div>
        <div
            class="day"
            :class="{sunday: day === 0, today: idx === 2}"
            v-for="([day, date], idx) in days"
            :key="idx"
        >
            <div>
                <div>{{ date.toDateString() }}</div>
                <template v-if="data[day]">
                    <b-table :items="data[day]['10d']"></b-table>
                </template>
            </div>
        </div>
    </span>
</template>

<script>
module.exports = {
    name: 'journal',
    methods: {
        agree() {
            localStorage.setItem('lyceum-disclaimer', true);
            this.$asyncComputed.disclaimer.update();
        },
    },
    computed: {
        ready() {
            return !!this.data;
        },
        days() {
            let today = new Date(), start = (today.getDay() + 7 - 2);
            return (
                _.range(start, start + 7)
                .map(x => x % 7)
                .map(x => {
                    let date = new Date();
                    date.setDate(date.getDate() + (x - date.getDay()));
                    if (x < start % 7) date.setDate(date.getDate() + 7);
                    return ([x, date]);
                })
            );
        },
    },
    asyncComputed: {
        disclaimer: () => localStorage.getItem('lyceum-disclaimer'),
        async data() {
            return (
                _(await Promise.all(
                    _.range(1, 7)
                    .map(d => (
                        fetch(`https://lycutils.ipq.co/tmtbl/tmtbl${d}.js`)
                        .then(response => response.text())
                        .then(data => data.slice(10))
                        .then(JSON.parse)
                        .then(x => ([d, x]))
                    ))
                ))
                .fromPairs()
                .value()
            );
        },
    },
}
</script>

<style scoped>
div.day {
    border-bottom: 1px solid black;
}
td {
    padding: 5px 10px;
    border: 1px solid #080;
}
thead {
    display: none;
}
table [aria-colindex="1"] {
    min-width: 140px;
}
table [aria-colindex="3"] {
    min-width: 170px;
}
.sunday {
    background-color: rgb(255, 155, 155);
}
.today {
    background-color: rgb(155, 255, 155);
}
.day, .day > div > div {
    width: 100%;
    display: flex;
    justify-content: center;
}
.disclaimer {
    padding-bottom: 10px;
    border-bottom: 1px solid black;
}
.disclaimer > div {
    padding-bottom: 10px;
}
</style>
