export const sequencia = {
    getTreeNodesData() {
        return [
            {
                key: '0',
                data: {
                    name: 'Semana 1',
                },
                children: [
                    {
                        key: '0-0',
                        data: {
                            name: 'Atividade 1',
                        }
                    },
                    {
                        key: '0-1',
                        data: {
                            name: 'Atividade 2',
                        }
                    },
                    {
                        key: '0-2',
                        data: {
                            name: 'Atividade 3',
                        }
                    },
                    {
                        key: '0-3',
                        data: {
                            name: 'Atividade 4',
                        }
                    },
                ]
            },
            {
                key: '1',
                data: {
                    name: 'Semana 2',
                },
                children: [
                    {
                        key: '1-0',
                        data: {
                            name: 'Atividade 5',
                        }
                    },
                    {
                        key: '1-1',
                        data: {
                            name: 'Atividade 6',
                        }
                    },
                    {
                        key: '1-2',
                        data: {
                            name: 'Atividade 7',
                        }
                    },
                ]
            },
        ]
    },

    getTreeTableNodes() {
        return Promise.resolve(this.getTreeNodesData());
    },
};

export const sequencia2 = [
    {
        semana: "Semana 1",
    },
    {
        semana: "Semana 2",
    },
    {
        semana: "Semana 3",
    },
    {
        semana: "Semana 4",
    },
    {
        semana: "Semana 5",
    },
    {
        semana: "Semana 6",
    },
    {
        semana: "Semana 7",
    },
    {
        semana: "Semana 8",
    },
    
    ];
    