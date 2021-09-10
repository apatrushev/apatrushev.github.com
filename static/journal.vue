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
        <div>
            Показывать дней:
            <b-form-select
                v-model="journal_days"
                :options="journal_options"
                @change="journal_days_update"
            ></b-form-select>
        </div>
        <div
            class="day"
            :class="{sunday: day === 0, today: day === (new Date()).getDay()}"
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
    data() {
        return {
            journal_options: [1, 2, 3 ,7],
        };
    },
    methods: {
        agree() {
            localStorage.setItem('lyceum-disclaimer', true);
            this.$asyncComputed.disclaimer.update();
        },
        journal_days_update(value) {
            localStorage.setItem('lyceum-journal-days', value);
        },
    },
    computed: {
        ready() {
            return !!this.journal_days && !!this.data;
        },
        days() {
            let today = new Date(), start = (today.getDay() + 7 - 2),
                result = (
                    _.range(start, start + 7)
                    .map(x => x % 7)
                    .map(x => {
                        let date = new Date();
                        date.setDate(date.getDate() + (x - date.getDay()));
                        if (x < start % 7) date.setDate(date.getDate() + 7);
                        return ([x, date]);
                    })
                );
            if (!this.journal_days || this.journal_days === 7) {
                return result;
            } else if (this.journal_days === 2) {
                return _.slice(result, 2, 4 + !parseInt(result[3][0]));
            } else if (this.journal_days === 3) {
                return _.slice(result, 1, 4 + !parseInt(result[3][0]));
            };
            return _.slice(result, 2, 3);
        },
    },
    asyncComputed: {
        disclaimer: () => localStorage.getItem('lyceum-disclaimer'),
        journal_days: () => parseInt(localStorage.getItem('lyceum-journal-days') || 7),
        async data() {
            return (
                _(await Promise.all(
                    _.range(1, 7)
                    .map(d => (
                        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://lycutils.ipq.co/tmtbl/tmtbl${d}.js`)}`)
                        .then(response => response.json())
                        .then(response => response.contents)
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
@media (max-width: 980px) {
    .day > div {
        width: 100%;
    }
}
@media (min-width: 981px) {
    table {
        min-width: 25em;
    }
}
</style>
