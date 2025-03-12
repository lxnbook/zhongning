                        avatar={<Avatar icon={<TrophyOutlined />} style={{ backgroundColor: '#faad14' }} />}
                        title={certificate.title}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              颁发机构: {certificate.issuer}
                            </Text>
                            <Text type="secondary">
                              获得日期: {moment(certificate.issueDate).format('YYYY-MM-DD')}
                            </Text>
                            {certificate.expiryDate && (
                              <Text type="secondary">
                                有效期至: {moment(certificate.expiryDate).format('YYYY-MM-DD')}
                              </Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无证书" />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染社区标签页
  const renderCommunitiesTab = () => {
    return (
      <div className="communities-container">
        <Row gutter={16}>
          <Col span={16}>
            <Card>
              <Input.Search
                placeholder="搜索社区"
                style={{ marginBottom: 16 }}
                onSearch={value => setSearchText(value)}
              />
              
              <List
                itemLayout="vertical"
                dataSource={communities.filter(community => 
                  community.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  community.description.toLowerCase().includes(searchText.toLowerCase())
                )}
                renderItem={community => (
                  <List.Item
                    key={community.id}
                    actions={[
                      <Button 
                        type={community.isJoined ? "default" : "primary"}
                        onClick={() => community.isJoined ? 
                          setSelectedCommunity(community) : 
                          handleCommunityJoin(community.id)
                        }
                      >
                        {community.isJoined ? "查看" : "加入"}
                      </Button>,
                      <Space>
                        <TeamOutlined />
                        <span>{community.memberCount} 成员</span>
                      </Space>,
                      <Space>
                        <MessageOutlined />
                        <span>{community.discussionCount} 讨论</span>
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={community.avatar} icon={<TeamOutlined />} size={64} />}
                      title={
                        <Space>
                          <Text strong style={{ fontSize: 16 }}>{community.name}</Text>
                          {community.isOfficial && <Tag color="blue">官方</Tag>}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>{community.description}</Text>
                          <Space style={{ marginTop: 8 }}>
                            {community.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>
                        </Space>
                      }
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text strong>最近活动:</Text>
                      <List
                        size="small"
                        dataSource={community.recentActivities.slice(0, 2)}
                        renderItem={activity => (
                          <List.Item>
                            <Space>
                              <Avatar size="small" src={activity.user.avatar} icon={<UserOutlined />} />
                              <Text>{activity.user.name}</Text>
                              <Text type="secondary">{activity.action}</Text>
                              <Text type="secondary">{moment(activity.time).fromNow()}</Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={8}>
            <Card title="推荐社区">
              <List
                itemLayout="horizontal"
                dataSource={communities.filter(c => c.isRecommended).slice(0, 5)}
                renderItem={community => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={community.avatar} icon={<TeamOutlined />} />}
                      title={community.name}
                      description={
                        <Space>
                          <TeamOutlined /> {community.memberCount} 成员
                        </Space>
                      }
                    />
                    <Button 
                      size="small"
                      type={community.isJoined ? "default" : "primary"}
                      onClick={() => community.isJoined ? 
                        setSelectedCommunity(community) : 
                        handleCommunityJoin(community.id)
                      }
                    >
                      {community.isJoined ? "查看" : "加入"}
                    </Button>
                  </List.Item>
                )}
              />
            </Card>
            
            <Card title="我的社区" style={{ marginTop: 16 }}>
              {communities.filter(c => c.isJoined).length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={communities.filter(c => c.isJoined)}
                  renderItem={community => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={community.avatar} icon={<TeamOutlined />} />}
                        title={community.name}
                        description={
                          <Text type="secondary">
                            {community.unreadMessages > 0 ? 
                              `${community.unreadMessages} 条未读消息` : 
                              '无未读消息'}
                          </Text>
                        }
                      />
                      <Button 
                        size="small"
                        onClick={() => setSelectedCommunity(community)}
                      >
                        查看
                      </Button>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="您尚未加入任何社区" />
              )}
            </Card>
            
            <Card title="即将举行的活动" style={{ marginTop: 16 }}>
              {communities.some(c => c.upcomingEvents && c.upcomingEvents.length > 0) ? (
                <List
                  itemLayout="horizontal"
                  dataSource={communities
                    .filter(c => c.upcomingEvents && c.upcomingEvents.length > 0)
                    .flatMap(c => c.upcomingEvents.map(event => ({
                      ...event,
                      communityName: c.name,
                      communityId: c.id
                    })))
                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                    .slice(0, 3)
                  }
                  renderItem={event => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                        title={event.title}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              社区: {event.communityName}
                            </Text>
                            <Text type="secondary">
                              时间: {moment(event.startTime).format('MM-DD HH:mm')}
                            </Text>
                          </Space>
                        }
                      />
                      <Button 
                        size="small"
                        onClick={() => {
                          setSelectedCommunity(communities.find(c => c.id === event.communityId));
                        }}
                      >
                        详情
                      </Button>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无即将举行的活动" />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染资源标签页
  const renderResourcesTab = () => {
    return (
      <div className="resources-container">
        <Row gutter={16}>
          <Col span={18}>
            <Card>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                  placeholder="搜索资源"
                  style={{ width: 300 }}
                  onSearch={value => setSearchText(value)}
                />
                <Space>
                  <Select
                    placeholder="分类筛选"
                    style={{ width: 150 }}
                    value={filterCategory}
                    onChange={value => setFilterCategory(value)}
                  >
                    <Option value="all">全部分类</Option>
                    <Option value="article">文章</Option>
                    <Option value="video">视频</Option>
                    <Option value="book">书籍</Option>
                    <Option value="tool">工具</Option>
                    <Option value="research">研究</Option>
                  </Select>
                  <Select
                    placeholder="排序方式"
                    style={{ width: 150 }}
                    value={sortOrder}
                    onChange={value => setSortOrder(value)}
                  >
                    <Option value="popular">最受欢迎</Option>
                    <Option value="newest">最新发布</Option>
                    <Option value="rating">评分最高</Option>
                  </Select>
                </Space>
              </div>
              
              <List
                itemLayout="vertical"
                dataSource={resources
                  .filter(resource => 
                    (filterCategory === 'all' || resource.category === filterCategory) &&
                    (resource.title.toLowerCase().includes(searchText.toLowerCase()) ||
                     resource.description.toLowerCase().includes(searchText.toLowerCase()))
                  )
                  .sort((a, b) => {
                    if (sortOrder === 'popular') return b.viewCount - a.viewCount;
                    if (sortOrder === 'newest') return new Date(b.publishedAt) - new Date(a.publishedAt);
                    if (sortOrder === 'rating') return b.rating - a.rating;
                    return 0;
                  })
                }
                renderItem={resource => (
                  <List.Item
                    key={resource.id}
                    actions={[
                      <Space>
                        <StarOutlined />
                        <span>{resource.rating.toFixed(1)}</span>
                      </Space>,
                      <Space>
                        <EyeOutlined />
                        <span>{resource.viewCount}</span>
                      </Space>,
                      <Space>
                        <MessageOutlined />
                        <span>{resource.commentCount}</span>
                      </Space>,
                      <Space>
                        <ShareAltOutlined />
                        <span>{resource.shareCount}</span>
                      </Space>
                    ]}
                    extra={
                      resource.category === 'video' && resource.thumbnailUrl ? (
                        <img 
                          src={resource.thumbnailUrl} 
                          alt={resource.title} 
                          style={{ width: 200, height: 112, objectFit: 'cover' }}
                        />
                      ) : (
                        <Avatar 
                          shape="square" 
                          size={64} 
                          icon={
                            resource.category === 'article' ? <FileTextOutlined /> :
                            resource.category === 'video' ? <VideoCameraOutlined /> :
                            resource.category === 'book' ? <BookOutlined /> :
                            resource.category === 'tool' ? <ExperimentOutlined /> :
                            <FileSearchOutlined />
                          } 
                          style={{ 
                            backgroundColor: 
                              resource.category === 'article' ? '#1890ff' :
                              resource.category === 'video' ? '#f5222d' :
                              resource.category === 'book' ? '#52c41a' :
                              resource.category === 'tool' ? '#722ed1' :
                              '#faad14'
                          }}
                        />
                      )
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.title}
                          </a>
                          <Tag color={
                            resource.category === 'article' ? 'blue' :
                            resource.category === 'video' ? 'red' :
                            resource.category === 'book' ? 'green' :
                            resource.category === 'tool' ? 'purple' :
                            'orange'
                          }>
                            {
                              resource.category === 'article' ? '文章' :
                              resource.category === 'video' ? '视频' :
                              resource.category === 'book' ? '书籍' :
                              resource.category === 'tool' ? '工具' :
                              '研究'
                            }
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            作者: {resource.author} | 发布时间: {moment(resource.publishedAt).format('YYYY-MM-DD')}
                          </Text>
                          <Space style={{ marginTop: 4 }}>
                            {resource.tags.map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>
                        </Space>
                      }
                    />
                    <Paragraph 
                      ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
                      style={{ marginTop: 8 }}
                    >
                      {resource.description}
                    </Paragraph>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card title="热门资源">
              <List
                itemLayout="horizontal"
                dataSource={resources
                  .sort((a, b) => b.viewCount - a.viewCount)
                  .slice(0, 5)
                }
                renderItem={resource => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            resource.category === 'article' ? <FileTextOutlined /> :
                            resource.category === 'video' ? <VideoCameraOutlined /> :
                            resource.category === 'book' ? <BookOutlined /> :
                            resource.category === 'tool' ? <ExperimentOutlined /> :
                            <FileSearchOutlined />
                          } 
                          style={{ 
                            backgroundColor: 
                              resource.category === 'article' ? '#1890ff' :
                              resource.category === 'video' ? '#f5222d' :
                              resource.category === 'book' ? '#52c41a' :
                              resource.category === 'tool' ? '#722ed1' :
                              '#faad14'
                          }}
                        />
                      }
                      title={
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      }
                      description={
                        <Space>
                          <EyeOutlined /> {resource.viewCount}
                          <StarOutlined /> {resource.rating.toFixed(1)}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
            
            <Card title="推荐资源" style={{ marginTop: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={resources
                  .filter(r => r.isRecommended)
                  .slice(0, 5)
                }
                renderItem={resource => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={
                            resource.category === 'article' ? <FileTextOutlined /> :
                            resource.category === 'video' ? <VideoCameraOutlined /> :
                            resource.category === 'book' ? <BookOutlined /> :
                            resource.category === 'tool' ? <ExperimentOutlined /> :
                            <FileSearchOutlined />
                          } 
                          style={{ 
                            backgroundColor: 
                              resource.category === 'article' ? '#1890ff' :
                              resource.category === 'video' ? '#f5222d' :
                              resource.category === 'book' ? '#52c41a' :
                              resource.category === 'tool' ? '#722ed1' :
                              '#faad14'
                          }}
                        />
                      }
                      title={
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      }
                      description={resource.category === 'article' ? '文章' :
                                   resource.category === 'video' ? '视频' :
                                   resource.category === 'book' ? '书籍' :
                                   resource.category === 'tool' ? '工具' :
                                   '研究'}
                    />
                  </List.Item>
                )}
              />
            </Card>
            
            <Card title="上传资源" style={{ marginTop: 16 }}>
              <Upload.Dragger>
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                  支持单个或批量上传，分享您的教育资源
                </p>
              </Upload.Dragger>
              
              <Divider />
              
              <Form layout="vertical">
                <Form.Item label="资源链接">
                  <Input prefix={<LinkOutlined />} placeholder="输入资源链接" />
                </Form.Item>
                <Button type="primary" block>
                  分享链接
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <BookOutlined />
          <span>教师专业发展</span>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<RobotOutlined />}>
            AI学习助手
          </Button>
          <Button icon={<SettingOutlined />}>
            设置
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              课程学习
            </span>
          } 
          key="courses"
        >
          {renderCoursesTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <TeamOutlined />
              专业社区
            </span>
          } 
          key="communities"
        >
          {renderCommunitiesTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              教育资源
            </span>
          } 
          key="resources"
        >
          {renderResourcesTab()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <RiseOutlined />
              成长记录
            </span>
          } 
          key="growth"
        >
          {renderGrowthTab()}
        </TabPane>
      </Tabs>
      
      {/* 课程详情模态框 */}
      <Modal
        title={selectedCourse?.title}
        open={selectedCourse !== null}
        onCancel={() => setSelectedCourse(null)}
        footer={null}
        width={800}
      >
        {selectedCourse && (
          <div className="course-detail">
            {/* 课程详情内容 */}
          </div>
        )}
      </Modal>
      
      {/* 社区详情模态框 */}
      <Modal
        title={selectedCommunity?.name}
        open={selectedCommunity !== null}
        onCancel={() => setSelectedCommunity(null)}
        footer={null}
        width={800}
      >
        {selectedCommunity && (
          <div className="community-detail">
            {/* 社区详情内容 */}
          </div>
        )}
      </Modal>
      
      {/* 目标创建模态框 */}
      <Modal
        title="创建学习目标"
        open={goalModalVisible}
        onOk={handleGoalSubmit}
        onCancel={() => setGoalModalVisible(false)}
      >
        <Form form={goalForm} layout="vertical">
          {/* 目标表单内容 */}
        </Form>
      </Modal>
      
      {/* 反思创建模态框 */}
      <Modal
        title="添加学习反思"
        open={reflectionModalVisible}
        onOk={handleReflectionSubmit}
        onCancel={() => setReflectionModalVisible(false)}
        width={700}
      >
        <Form form={reflectionForm} layout="vertical">
          {/* 反思表单内容 */}
        </Form>
      </Modal>
      
      {/* 证书上传模态框 */}
      <Modal
        title="上传证书"
        open={certificateModalVisible}
        onOk={handleCertificateSubmit}
        onCancel={() => setCertificateModalVisible(false)}
      >
        <Form form={certificateForm} layout="vertical">
          {/* 证书表单内容 */}
        </Form>
      </Modal>
      
      {/* 图片预览 */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default ProfessionalDevelopment; 