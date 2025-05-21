import { INode } from '../domain/model.js'

export const largeDemoSystem: INode = {
  'id': '0',
  'name': 'squattiness',
  'type': 'System',
  'nodes': [
    {
      'id': '1',
      'name': 'tamoxifen',
      'type': 'Microservice'
    },
    {
      'id': '2',
      'name': 'stromatic',
      'type': 'Microservice'
    },
    {
      'id': '3',
      'name': 'marmalising',
      'type': 'Microservice'
    },
    {
      'id': '4',
      'name': 'hydrological',
      'type': 'MessageExchange'
    },
    {
      'id': '5',
      'name': 'inland',
      'type': 'System',
      'nodes': [
        {
          'id': '6',
          'name': 'anyon',
          'type': 'Microservice',
          'properties': {
            'shared': true,
            'forked': true
          }
        },
        {
          'id': '7',
          'name': 'mezquit',
          'type': 'Microservice'
        },
        {
          'id': '8',
          'name': 'endometritis',
          'type': 'Microservice'
        },
        {
          'id': '9',
          'name': 'questionnaires',
          'type': 'Microservice',
          'properties': {
            'shared': true
          }
        },
        {
          'id': '10',
          'name': 'upleans',
          'type': 'Microservice',
          'properties': {
            'reduced': true,
            'shared': true,
            'forked': true
          }
        },
        {
          'id': '11',
          'name': 'clottiest',
          'type': 'Microservice'
        },
        {
          'id': '12',
          'name': 'northeasters',
          'type': 'Microservice'
        },
        {
          'id': '13',
          'name': 'northeasters',
          'type': 'MessageExchange'
        },
        {
          'id': '14',
          'name': 'intracity',
          'type': 'MessageExchange'
        }
      ],
      'edges': [
        {
          'sourceId': '6',
          'targetId': '7',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '6',
          'targetId': '8',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '9',
          'targetId': '8',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '13',
          'targetId': '7',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '13',
          'targetId': '10',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '10',
          'targetId': '6',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '8',
          'targetId': '11',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '7',
          'targetId': '11',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '12',
          'targetId': '14',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '15',
      'name': 'lenticles',
      'type': 'System',
      'nodes': [
        {
          'id': '16',
          'name': 'lenticles',
          'type': 'Microservice'
        },
        {
          'id': '17',
          'name': 'nautilus',
          'type': 'Microservice'
        }
      ],
      'edges': [
        {
          'sourceId': '16',
          'targetId': '17',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '18',
      'name': 'insensiblenesses',
      'type': 'System',
      'nodes': [
        {
          'id': '19',
          'name': 'insensiblenesses',
          'type': 'Microservice'
        },
        {
          'id': '20',
          'name': 'harpy',
          'type': 'Microservice'
        },
        {
          'id': '21',
          'name': 'jointnesses',
          'type': 'Microservice',
          'properties': {
            'url': 'hello'
          }
        },
        {
          'id': '22',
          'name': 'shweshwes',
          'type': 'Microservice'
        },
        {
          'id': '23',
          'name': 'imblaze',
          'type': 'Microservice'
        },
        {
          'id': '24',
          'name': 'scaffolds',
          'type': 'Microservice'
        },
        {
          'id': '25',
          'name': 'traducian',
          'type': 'Microservice'
        },
        {
          'id': '26',
          'name': 'wammuses',
          'type': 'Microservice'
        },
        {
          'id': '27',
          'name': 'hygeist',
          'type': 'Microservice'
        },
        {
          'id': '28',
          'name': 'archconservative',
          'type': 'Microservice'
        },
        {
          'id': '29',
          'name': 'pianiste',
          'type': 'Microservice'
        },
        {
          'id': '30',
          'name': 'talipats',
          'type': 'Microservice'
        },
        {
          'id': '31',
          'name': 'archconservative',
          'type': 'MessageExchange'
        },
        {
          'id': '32',
          'name': 'harpy',
          'type': 'MessageExchange'
        }
      ],
      'edges': [
        {
          'sourceId': '31',
          'targetId': '20',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '32',
          'targetId': '20',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '21',
          'targetId': '22',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '32',
          'targetId': '23',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '24',
          'targetId': '19',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '21',
          'targetId': '24',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '24',
          'targetId': '25',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '25',
          'targetId': '26',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '19',
          'targetId': '26',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '24',
          'targetId': '27',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '33',
      'name': 'hydrological',
      'type': 'System',
      'nodes': [
        {
          'id': '34',
          'name': 'pencilings',
          'type': 'Microservice'
        },
        {
          'id': '35',
          'name': 'enumerate',
          'type': 'Microservice'
        },
        {
          'id': '36',
          'name': 'gormandisings',
          'type': 'Microservice'
        },
        {
          'id': '37',
          'name': 'smokelike',
          'type': 'Microservice'
        },
        {
          'id': '38',
          'name': 'hydrological',
          'type': 'Microservice'
        },
        {
          'id': '39',
          'name': 'pured',
          'type': 'Microservice'
        },
        {
          'id': '40',
          'name': 'wapentakes',
          'type': 'Microservice'
        },
        {
          'id': '41',
          'name': 'hoddles',
          'type': 'Microservice'
        },
        {
          'id': '42',
          'name': 'oversaucing',
          'type': 'MessageExchange'
        },
        {
          'id': '43',
          'name': 'hygeist',
          'type': 'MessageExchange'
        },
        {
          'id': '44',
          'name': 'knive',
          'type': 'MessageExchange'
        }
      ],
      'edges': [
        {
          'sourceId': '34',
          'targetId': '35',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '36',
          'targetId': '37',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '42',
          'targetId': '36',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '42',
          'targetId': '38',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '38',
          'targetId': '42',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '43',
          'targetId': '38',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '39',
          'targetId': '38',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '40',
          'targetId': '39',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '44',
          'targetId': '34',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '37',
          'targetId': '44',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '39',
          'targetId': '41',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '41',
          'targetId': '44',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '45',
      'name': 'symbolisms',
      'type': 'System',
      'nodes': [
        {
          'id': '46',
          'name': 'shanteys',
          'type': 'Microservice'
        },
        {
          'id': '47',
          'name': 'subastral',
          'type': 'Microservice'
        }
      ],
      'edges': [
        {
          'sourceId': '47',
          'targetId': '46',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '48',
      'name': 'prevailing',
      'type': 'System',
      'nodes': [
        {
          'id': '49',
          'name': 'perchloroethylene',
          'type': 'Microservice'
        },
        {
          'id': '50',
          'name': 'reduciblenesses',
          'type': 'Microservice'
        },
        {
          'id': '51',
          'name': 'pleochroism',
          'type': 'Microservice'
        }
      ],
      'edges': [
        {
          'sourceId': '49',
          'targetId': '49',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '49',
          'targetId': '50',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '51',
          'targetId': '50',
          'type': 'SyncInfoFlow'
        }
      ]
    },
    {
      'id': '52',
      'name': 'angosturas',
      'type': 'System',
      'nodes': [
        {
          'id': '53',
          'name': 'plenipotent',
          'type': 'Microservice'
        },
        {
          'id': '54',
          'name': 'groundswells',
          'type': 'Microservice'
        },
        {
          'id': '55',
          'name': 'hawthorns',
          'type': 'Microservice'
        },
        {
          'id': '56',
          'name': 'grumblier',
          'type': 'Microservice'
        },
        {
          'id': '57',
          'name': 'sciaticas',
          'type': 'Microservice'
        },
        {
          'id': '58',
          'name': 'copartnery',
          'type': 'Microservice'
        },
        {
          'id': '59',
          'name': 'lignicole',
          'type': 'Microservice'
        },
        {
          'id': '60',
          'name': 'consignees',
          'type': 'Microservice'
        },
        {
          'id': '61',
          'name': 'seemers',
          'type': 'Microservice'
        },
        {
          'id': '62',
          'name': 'heterogeneously',
          'type': 'Microservice'
        }
      ],
      'edges': [
        {
          'sourceId': '53',
          'targetId': '54',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '55',
          'targetId': '56',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '56',
          'targetId': '53',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '57',
          'targetId': '57',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '57',
          'targetId': '58',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '58',
          'targetId': '55',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '57',
          'targetId': '59',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '57',
          'targetId': '60',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '60',
          'targetId': '61',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '63',
      'name': 'bottoming',
      'type': 'System',
      'nodes': [
        {
          'id': '64',
          'name': 'bottoming',
          'type': 'Microservice'
        },
        {
          'id': '65',
          'name': 'tactuality',
          'type': 'Microservice'
        }
      ],
      'edges': [
        {
          'sourceId': '65',
          'targetId': '64',
          'type': 'AsyncInfoFlow'
        }
      ]
    },
    {
      'id': '66',
      'name': 'lazzi',
      'type': 'System',
      'nodes': [
        {
          'id': '67',
          'name': 'shoplifters',
          'type': 'Microservice'
        }
      ]
    },
    {
      'id': '68',
      'name': 'tenderizer',
      'type': 'System',
      'nodes': [
        {
          'id': '69',
          'name': 'flexibilities',
          'type': 'Microservice'
        }
      ]
    },
    {
      'id': '70',
      'name': 'trajected',
      'type': 'System',
      'nodes': [
        {
          'id': '71',
          'name': 'perverseness',
          'type': 'Microservice'
        },
        {
          'id': '72',
          'name': 'nonflying',
          'type': 'Microservice'
        },
        {
          'id': '73',
          'name': 'yobbism',
          'type': 'Microservice'
        }
      ]
    },
    {
      'id': '74',
      'name': 'paganizing',
      'type': 'System',
      'nodes': [
        {
          'id': '75',
          'name': 'desecrated',
          'type': 'Microservice'
        },
        {
          'id': '76',
          'name': 'mutisms',
          'type': 'MessageExchange'
        },
        {
          'id': '77',
          'name': 'crufty',
          'type': 'MessageExchange'
        }
      ],
      'edges': [
        {
          'sourceId': '75',
          'targetId': '76',
          'type': 'AsyncInfoFlow'
        },
        {
          'sourceId': '75',
          'targetId': '77',
          'type': 'AsyncInfoFlow'
        }
      ]
    }
  ],
  'edges': [
    {
      'sourceId': '6',
      'targetId': '16',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '7',
      'targetId': '16',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '19',
      'targetId': '17',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '6',
      'targetId': '46',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '7',
      'targetId': '55',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '6',
      'targetId': '64',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '6',
      'targetId': '67',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '11',
      'targetId': '26',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '57',
      'targetId': '69',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '6',
      'targetId': '24',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '19',
      'targetId': '37',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '6',
      'targetId': '47',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '11',
      'targetId': '47',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '4',
      'targetId': '47',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '17',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '67',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '26',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '11',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '64',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '19',
      'targetId': '40',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '46',
      'targetId': '57',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '64',
      'targetId': '36',
      'type': 'AsyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '16',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '16',
      'targetId': '1',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '25',
      'targetId': '1',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '11',
      'targetId': '1',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '19',
      'targetId': '1',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '38',
      'targetId': '1',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '27',
      'targetId': '46',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '7',
      'targetId': '46',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '71',
      'targetId': '46',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '71',
      'targetId': '56',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '72',
      'targetId': '8',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '51',
      'targetId': '64',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '51',
      'targetId': '67',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '25',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '73',
      'targetId': '25',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '19',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '73',
      'targetId': '19',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '72',
      'targetId': '24',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '37',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '71',
      'targetId': '47',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '36',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '50',
      'targetId': '41',
      'type': 'SyncInfoFlow'
    },
    {
      'sourceId': '35',
      'targetId': '4',
      'type': 'AsyncInfoFlow'
    }
  ]
}
