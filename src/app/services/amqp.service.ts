import amqplib from 'amqplib';
import uuidv4 from 'uuid/v4';
import http from 'http';
import sessionMessageService from '@service/message.service';

/* Manages creation of dedicated message queue in rabbit mq, getting/sending to all active queues, listening to service-specific queue, and closing queue on exit */
class AMQPService {
    private connection: amqplib.Connection = null;
    private channel: amqplib.Channel;
    private queueName: string;

    /* Creates queue and stores queue name */
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

    /* Gets all active queues from rabbit using basic auth, and distributes message to all. Each service determinies whether or not message should be sent to socket connections based on
    the members in the object and the connections stored in the connection service */
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

    /* listens to service-specific queue */
    private listen = () => this.channel.consume(this.queueName, sessionMessageService.sendMessage, { noAck: true });

    /* Closes service-specific queue */
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
