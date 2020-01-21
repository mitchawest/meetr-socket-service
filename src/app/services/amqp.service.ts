import amqplib from 'amqplib';
import uuidv4 from 'uuid/v4';
import http from 'http';
import messageService from '@service/message.service';

class AMQPService {
    private connection: amqplib.Connection = null;
    private channel: amqplib.Channel;
    private queueName: string;
    init = () =>
        new Promise((resolve, reject) => {
            amqplib
                .connect(process.env.AMQP_URL)
                .then(conn => {
                    this.connection = conn;
                    this.connection
                        .createChannel()
                        .then(channel => {
                            this.channel = channel;
                            this.queueName = uuidv4();
                            this.channel
                                .assertQueue(this.queueName)
                                .then(() => {
                                    this.listen();
                                    resolve();
                                })
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });

    send = (message: object) =>
        new Promise((resolve, reject) => {
            http.get(
                process.env.AMQP_GET_QUEUES,
                { headers: { Authorization: `Basic ${Buffer.from(process.env.AMQP_USER + ':' + process.env.AMQP_PASSWORD).toString('base64')}`, 'Content-Type': 'application/json' } },
                response => {
                    response.on('data', data => {
                        try {
                            const jsonData = JSON.parse(data.toString());
                            const queueNames: string[] = jsonData.map((queue: any) => queue.name);
                            queueNames.forEach(name => {
                                this.connection
                                    .createChannel()
                                    .then(channel => {
                                        channel
                                            .assertQueue(name)
                                            .then(() => {
                                                channel.sendToQueue(name, Buffer.from(JSON.stringify(message), 'utf-8'));
                                                resolve();
                                            })
                                            .catch(err => reject(err));
                                    })
                                    .catch(err => reject(err));
                            });
                        } catch (err) {
                            reject(err);
                        }
                    });
                }
            );
        });

    private listen = () => this.channel.consume(this.queueName, messageService.sendMessage, { noAck: true });

    close = () =>
        new Promise((resolve, reject) => {
            if (this.connection && this.queueName) {
                this.channel
                    .deleteQueue(this.queueName)
                    .then(() => {
                        this.connection
                            .close()
                            .then(() => resolve())
                            .catch(err => reject(err));
                    })
                    .catch(err => reject(err));
            } else {
                resolve();
            }
        });
}

const amqpService = new AMQPService();

export default amqpService;
