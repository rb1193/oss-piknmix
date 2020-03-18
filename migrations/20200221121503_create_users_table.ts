import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
    return await knex.schema.withSchema('public').hasTable('users').then((exists) => {
        if (exists) new Error("Users table already exists")
    }).then(() => {
        return knex.schema.withSchema('public').createTable('users', function (table) {
            table.increments()
            table.string('email').unique()
            table.string('profile_img_src').nullable()
            table.string('password')
            table.timestamps()
        })
    }).then(() => "Users table created")
}


export async function down(knex: Knex): Promise<any> {
    return await knex.schema.withSchema('public').hasTable('users').then((exists) => {
        if (!exists) throw new Error('Users table does not exist')
    }).then(() => {
        return knex.schema.withSchema('public').dropTable('users')
    }).then(() => "Users table deleted")
}

