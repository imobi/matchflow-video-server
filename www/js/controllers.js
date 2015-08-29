'use strict';

/* Controllers */
angular.module('matchflow.controllers', [])
    .controller('MainController', ['$scope', function ($scope) {
        $scope.signOut = function() {
            // kill session and user here (this is incase the person presses back, 
            // then they will get logged out straight away)
            
            // then go to index...
            window.location = 'index.html';
        };
        // GENERAL CONFIG
        $scope.user = {
            id: 'default-user',
            firstName: 'Default',
            lastName: 'User',
            email: 'defaulty@email.com',
            password: '123',
            loginTime: 0,
            leagueList: [],
            teamList: [],
            eventGroupList: [],
            projectList: [],
            feedList: [
                {
                    id: 'tab1',
                    name: 'TAB 1',
                    filter: ''
                },
                {
                    id: 'tab2',
                    name: 'TAB 2',
                    filter: ''
                }
            ],
            notes: [
                {
                    id: 'note1',
                    name: 'NOTE 1',
                    type: 'standard',
                    action: ''
                },
                {
                    id: 'note2',
                    name: 'NOTE 2',
                    type: 'info',
                    action: ''
                },
                {
                    id: 'note3',
                    name: 'NOTE 3',
                    type: 'success',
                    action: ''
                },
                {
                    id: 'note4',
                    name: 'NOTE 4',
                    type: 'critical',
                    action: ''
                },
                {
                    id: 'note5',
                    name: 'NOTE 5',
                    type: 'warning',
                    action: ''
                }
            ],
            permissions: [
                { // default, everyone should have this
                    id: 'profileManager',
                    name: 'Profile Manager'
                },
                {
                    id: 'eventManager',
                    name: 'Event Manager'
                },
                {
                    id: 'leagueManager',
                    name: 'League Manager'
                },
                {
                    id: 'reportManager',
                    name: 'Report Manager'
                },
                {
                    id: 'subscriptionManager',
                    name: 'Subscription Manager'
                },
                {
                    id: 'teamManager',
                    name: 'Team Manager'
                }
            ]
        };
        $scope.sideBarConfiguration = {
            onclick: function(id) {
                $scope.showManagerDialog(id);
            },
            data: $scope.user.permissions
        };

        // Event Categories    
        $scope.manageEvents = {
            eventGroupToAdd: {
                name: '',
                bgColor: 'green',
                txtColor: 'white',
                eventToAdd: { 
                    name: '',
                    before: 500,
                    after: 500
                },
                eventList : []
            },
            eventGroupList: [],
            eventGroupMap: {},
            addEventGroup: function () {
                if ($scope.manageEvents.eventGroupToAdd && $scope.manageEvents.eventGroupToAdd.name && 
                    $scope.manageEvents.eventGroupToAdd.name.length > 0) {
                    $scope.manageEvents.eventGroupList[$scope.manageEvents.eventGroupList.length] = $scope.manageEvents.eventGroupToAdd;
                    $scope.manageEvents.eventGroupMap[$scope.manageEvents.eventGroupToAdd.name] = $scope.manageEvents.eventGroupToAdd;
                    $scope.manageEvents.clearInput();
                }
            },
            clearInput: function() {
                $scope.manageEvents.eventGroupToAdd = {
                    name: '',
                    bgColor: 'green',
                    txtColor: 'white',
                    eventToAdd: { 
                        name: '',
                        before: 500,
                        after: 500
                    },
                    eventList : []
                };
            },
            removeEventGroup: function (index) {
                var eventGroup = $scope.manageEvents.eventGroupList[index];
                $scope.manageEvents.eventGroupMap[eventGroup.name] = undefined;
                eventGroup = undefined;
                $scope.manageEvents.eventGroupList.splice(index, 1);
            },
            addEventToGroup : function(name) {
                if ($scope.manageEvents.eventGroupMap[name] !== undefined) {
                    $scope.manageEvents.eventGroupMap[name].eventList[$scope.manageEvents.eventGroupMap[name].eventList.length] = $scope.manageEvents.eventGroupMap[name].eventToAdd;
                    $scope.manageEvents.clearEventInput(name);
                }
            },
            clearEventInput: function(name) {
                if ($scope.manageEvents.eventGroupMap[name] !== undefined) {
                    $scope.manageEvents.eventGroupMap[name].eventToAdd = { 
                        name: '',
                        before: 500,
                        after: 500
                    };
                }
            },
            removeEventFromGroup : function(name,index) {
                if ($scope.manageEvents.eventGroupMap[name] !== undefined) {
                    $scope.manageEvents.eventGroupMap[name].eventList.splice(index, 1);
                }
            }
        };
        $scope.showManagerDialog = function (id) {
            if (id === 'eventManager') {
                $scope.manageEvents.clearInput();
            } else if (id === 'profileManager') {
                $scope.managePlayer = {
                    id: 'player_1',
                    firstName: 'Firsty',
                    surnameName: 'Namey',
                    idPhoto: '<img src="img/idphoto.png" alt="idphoto" class="player-manager-id-photo">',
                    history: [
                        '...1','...2','...3'
                    ]
                };
            } else if (id === 'leagueManager') {
                $scope.manageLeague = {
                    leagues: [
                        {
                            id: 'league_1',
                            name: 'League 1',
                            teams: ['team_1','team_2','team_3'],
                            startDate: '01/01/2001',
                            endDate: '31/12/2001',
                            fixtures: [],
                            results: []
                        }
                    ]
                };
            } else if (id === 'teamManager') {
                $scope.manageCategories.categoryToAdd = {
                    teams: [
                        {
                            id: 'team_1',
                            name: 'Team 1',
                            players: ['player_1'],
                            coach: ''
                        }
                    ]
                };
            }
            angular.element('#'+id+'Dialog').modal('show');
        };
        // -- end: event categories
    }]).controller('DashboardController', ['$scope', function ($scope) {

    }]).controller('AnalyzerController', ['$scope', '$compile', '$http', '$location', '$route', '$timeout','$interval', function ($scope, $compile, $http, $location, $route, $timeout, $interval) {
        // we expecting a project ID in the URL
        var projectID = $route.current.params['pid'];
        if (projectID !== undefined) { // if there is one, load that project
            // we need to make a REST call to load the project, if it fails post the appropriate message
            // TODO
        } else { // else open the create project popup
            angular.element('#newProjectDetails').modal('show');
        }
        $scope.replaceAll = function (str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };
        
        /*************************************/
        // PROJECT SPECIFIC
        $scope.currentProject = {
            id: '',
            name: '',
            teams: '',
            league: '',
            eventGroups: [],
            addedTags: [],
            creationDate: '',
            gameDate: ''
        };
        // VIDEO PLAYER
        $scope.videoPlayer = {
            timer : {
                timestamp : new Date().getTime(),
                timerPosition : 0
            },
            videoPlaybackLength : 60 * 90, // 60 sec x 90 minutes
            status: 'paused',
            PAUSED:'paused',
            PLAYING:'playing',
            FORWARD:'fastforwarding',
            REWIND:'rewinding'
        };
        // INPUT FORMS
        $scope.newProject = {
            name: '',
            selectedTeams: '',
            selectedLeague: '',
            selectedEventGroups: [],// we save an array of references
            selectedGameDate: new Date(),
            // INHERITED DATA
            // we pull through important references for the create project dialog
            eventGroupList : $scope.$parent.manageEvents.eventGroupList,
            eventGroupMap : $scope.$parent.manageEvents.eventGroupMap
        };
        // CHART DATA
        $scope.eventGroupChart = {
            hasLabel : {},
            labels : [],
            data : []
        };
        
        // Tagline functionality
        $scope.addTagToTagLine = function (tagObj,groupName) {
            // only add if currently playing
            if ($scope.videoPlayer.status === 'playing') {
                var l = $scope.currentProject.addedTags.length;
                var time = $scope.videoPlayer.timer.timerPosition;
                // update chart data (event group)
                if ($scope.eventGroupChart.hasLabel[groupName] === undefined) {
                    // we can set the colors of the chart here: Chart.defaults.global.colours | Chart.defaults.Doughnut
                    $scope.eventGroupChart.hasLabel[groupName] = $scope.eventGroupChart.labels.length;
                    $scope.eventGroupChart.labels[$scope.eventGroupChart.labels.length] = groupName;
                    $scope.eventGroupChart.data[$scope.eventGroupChart.hasLabel[groupName]] = 1;
                } else {
                    $scope.eventGroupChart.data[$scope.eventGroupChart.hasLabel[groupName]]++;
                }
                $scope.currentProject.addedTags[l] = {
                    id: 'group_'+groupName+'_event_' + l + '_' + time,
                    time: time,
                    category: groupName,
                    name: tagObj.name,
                    before: tagObj.before,
                    after: tagObj.after
                };
            }
        };
        // DIALOG FUNCTIONS
        $scope.createNewProject = function() {
            if ($scope.newProject.name && $scope.newProject.name.length > 0 &&
                    $scope.newProject.selectedTeams !== undefined && $scope.newProject.selectedTeams.length > 0 &&
                    $scope.newProject.selectedLeague !== undefined && $scope.newProject.selectedLeague.length > 0 &&
                    $scope.newProject.selectedEventGroups !== undefined && $scope.newProject.selectedEventGroups.length > 0 &&
                    $scope.newProject.selectedGameDate !== undefined) {
                $scope.currentProject.name = $scope.newProject.name;
                $scope.currentProject.id = $scope.replaceAll($scope.newProject.name, ' ', '_');
                $scope.currentProject.league = $scope.newProject.selectedLeague;
                $scope.currentProject.teams = $scope.newProject.selectedTeams;
                $scope.currentProject.eventGroups = $scope.newProject.selectedEventGroups;
                $scope.currentProject.gameDate = $scope.newProject.selectedGameDate;
                angular.element('#newProjectDetails').modal('hide');
                $scope.newProject = {
                    name: '',
                    selectedTeams: '',
                    selectedLeague: '',
                    selectedEventGroups: [],// we save an array of references
                    selectedGameDate: '',
                    // INHERITED DATA
                    // we pull through important references for the create project dialog
                    eventGroupList : $scope.$parent.manageEvents.eventGroupList,
                    eventGroupMap : $scope.$parent.manageEvents.eventGroupMap
                };
            } else {
                // TODO form field validation
            }
        };
        $scope.returnToDashboard = function(dialogId) {
            angular.element('#'+dialogId).modal('hide');
            $timeout(function() {
                $location.url('/dashboard');
            },300);
        };
        
        // JQUERY UI
        $(document).ready(function () {
            // Or from within a configuration:
//            Dropzone.options.dropZone = {
//                init: function () {
//                    this.on('success', function (file) {
//                        console.log('uploaded file successfully[' + file.name + ']');
//                        $('#videoPlayer').children().remove();
//                        var playerInstance = jwplayer("videoPlayer").setup({
//                            file: 'upload/' + file.name,
//                            width: 640,
//                            height: 480
//                        });
//                        playerInstance.onReady(function () {
//                            console.log('initializing playback functions');
//                            playerInstance.onPlay(function () {
//                                console.log('play started');
//                                $scope.play = true;
//                            });
//                            playerInstance.onBuffer(function () {
//                                $scope.play = false;
//                                console.log('buffering');
//                            });
//                            playerInstance.onPause(function () {
//                                $scope.play = false;
//                                console.log('player paused');
//                            });
//                            playerInstance.onComplete(function () {
//                                $scope.play = false;
//                                console.log('play completed');
//                            });
//                        });
//
//                        $('#uploadArea').css('display', 'none');
//                        $('#videoPlayer').css('display', 'block');
//                    });
//                },
//                accept: function (file, done) {
//                    var indexMP4 = file.name.indexOf('.mp4');
//                    var length = file.name.length;
//                    if (indexMP4 > 0 && indexMP4 === length - 4) {
//                        done();
//                    } else {
//                        done('Invalid file type, please ensure file is .mp4.');
//                    }
//                }
//            };
            // DIALOG CODE
            // --- input forms :
//            $("#configureCategories").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Save: function () {
//                        // SAVE DATA HERE
//                        $scope.user.categoryList = new Array($scope.manageCategories.categoryList.length);
//                        for (var i = 0; i < $scope.manageCategories.categoryList.length; i++) {
//                            var categoryToAdd = $scope.manageCategories.categoryList[i];
//                            $scope.user.categoryList[i] = categoryToAdd;
//                        }
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#configureTeams").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Save: function () {
//                        // SAVE DATA HERE
//                        $scope.user.teamList = new Array($scope.manageTeams.teamList.length);
//                        for (var i = 0; i < $scope.manageTeams.teamList.length; i++) {
//                            var teamToAdd = $scope.manageTeams.teamList[i];
//                            $scope.user.teamList[i] = teamToAdd;
//                        }
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#configureSeasons").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Save: function () {
//                        // SAVE DATA HERE
//                        $scope.user.seasonList = new Array($scope.manageSeasons.seasonList.length);
//                        for (var i = 0; i < $scope.manageSeasons.seasonList.length; i++) {
//                            var seasonToAdd = $scope.manageSeasons.seasonList[i];
//                            $scope.user.seasonList[i] = seasonToAdd;
//                        }
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#createNewTemplate").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Create: function() {
//                        // SAVE DATA HERE
//                        $scope.user.templateList = new Array($scope.manageTemplates.templateList.length);
//                        for (var i = 0; i < $scope.manageTemplates.templateList.length; i++) {
//                            var templateToAdd = $scope.manageTemplates.templateList[i];
//                            $scope.user.templateList[i] = templateToAdd;
//                        }
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function() {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#createNewTag").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Cancel: function () {
//                        $scope.manageTagCreation.tagToAdd = {
//                            name: '',
//                            before: 0,
//                            after: 0
//                        };
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Add: function () {
//                        // SAVE DATA HERE
//                        $scope.manageTags.addTag();
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#editProjectDetails").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                open: function (event, ui) {
//                    $scope.editCurrentProject = {
//                        selectedCategory: $scope.currentProjectConfiguration.selectedCategory,
//                        selectedTeam: $scope.currentProjectConfiguration.selectedTeam,
//                        selectedSeason: $scope.currentProjectConfiguration.selectedSeason,
//                        selectedGameDate: $scope.currentProjectConfiguration.selectedGameDate,
//                        defaultTemplate: $scope.currentProjectConfiguration.defaultTemplate
//                    };
//                },
//                buttons: {
//                    Save: function () {
//                        // SAVE DATA HERE
//                        if ($scope.editCurrentProject.selectedCategory && $scope.editCurrentProject.selectedCategory.name && $scope.editCurrentProject.selectedCategory.name.length > 0 &&
//                                $scope.editCurrentProject.selectedTeam && $scope.editCurrentProject.selectedTeam.name && $scope.editCurrentProject.selectedTeam.name.length > 0 &&
//                                $scope.editCurrentProject.selectedSeason && $scope.editCurrentProject.selectedSeason.name && $scope.editCurrentProject.selectedSeason.name.length > 0 &&
//                                $scope.editCurrentProject.defaultTemplate && $scope.editCurrentProject.defaultTemplate.name && $scope.editCurrentProject.defaultTemplate.name.length > 0) {
//                            $scope.currentProjectConfiguration.selectedCategory = $scope.editCurrentProject.selectedCategory;
//                            $scope.currentProjectConfiguration.selectedTeam = $scope.editCurrentProject.selectedTeam;
//                            $scope.currentProjectConfiguration.selectedSeason = $scope.editCurrentProject.selectedSeason;
//                            $scope.currentProjectConfiguration.defaultTemplate = $scope.editCurrentProject.defaultTemplate;
//                            $scope.currentProjectConfiguration.selectedGameDate = $scope.editCurrentProject.selectedGameDate;
//                            $(this).dialog("close");
//                            $scope.editCurrentProject = {
//                                selectedCategory: $scope.user.categoryList[0],
//                                selectedTeam: $scope.user.teamList[0],
//                                selectedSeason: $scope.user.seasonList[0],
//                                selectedGameDate: '',
//                                defaultTemplate: $scope.user.tagTemplateList[0]
//                            };
//                        } else {
//                            // highlight incorrect fields
//                        }
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.editCurrentProject = {
//                            selectedCategory: $scope.user.categoryList[0],
//                            selectedTeam: $scope.user.teamList[0],
//                            selectedSeason: $scope.user.seasonList[0],
//                            selectedGameDate: '',
//                            defaultTemplate: $scope.user.tagTemplateList[0]
//                        };
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#newProjectDetails").dialog({
//                autoOpen: true,
//                dialogClass: "no-close",
//                closeOnEscape: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Create: function () {
//                        // SAVE DATA HERE
//                        if ($scope.newProject.name && $scope.newProject.name.length > 0 &&
//                                $scope.newProject.selectedCategory && $scope.newProject.selectedCategory.name && $scope.newProject.selectedCategory.name.length > 0 &&
//                                $scope.newProject.selectedTeam && $scope.newProject.selectedTeam.name && $scope.newProject.selectedTeam.name.length > 0 &&
//                                $scope.newProject.selectedSeason && $scope.newProject.selectedSeason.name && $scope.newProject.selectedSeason.name.length > 0 &&
//                                $scope.newProject.defaultTemplate && $scope.newProject.defaultTemplate.name && $scope.newProject.defaultTemplate.name.length > 0) {
//                            $scope.currentProjectConfiguration.name = $scope.newProject.name;
//                            $scope.currentProjectConfiguration.id = $scope.replaceAll($scope.newProject.name, ' ', '_');
//                            $scope.currentProjectConfiguration.selectedCategory = $scope.newProject.selectedCategory;
//                            $scope.currentProjectConfiguration.selectedTeam = $scope.newProject.selectedTeam;
//                            $scope.currentProjectConfiguration.selectedSeason = $scope.newProject.selectedSeason;
//                            $scope.currentProjectConfiguration.defaultTemplate = $scope.newProject.defaultTemplate;
//                            $scope.currentProjectConfiguration.selectedTemplate = $scope.currentProjectConfiguration.defaultTemplate;
//                            $scope.currentProjectConfiguration.selectedGameDate = $scope.newProject.selectedGameDate;
//                            $(this).dialog("close");
//                            $scope.newProject = {
//                                name: '',
//                                selectedCategory: $scope.user.categoryList[0],
//                                selectedTeam: $scope.user.teamList[0],
//                                selectedSeason: $scope.user.seasonList[0],
//                                selectedGameDate: '',
//                                defaultTemplate: $scope.user.tagTemplateList[0]
//                            };
//                        } else {
//                            // highlight incorrect fields
//                        }
//                        $scope.$apply();
//                    }
//                }
//            });
//            // --- date pickers for the dialogs above
//            $(".gameDate").datepicker({
//                changeMonth: true,
//                changeYear: true,
//                showOn: "button",
//                buttonImage: "img/calendar.gif",
//                buttonImageOnly: true
//            });
//            // --- deletion confirmations :
//            $("#confirmDeleteTemplate").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#confirmDeleteTag").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#confirmDeleteCategory").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#confirmDeleteTeam").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#confirmDeleteSeason").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
//            $("#confirmDeleteProject").dialog({
//                autoOpen: false,
//                resizable: false,
//                modal: true,
//                buttons: {
//                    Confirm: function () {
//                        // DELETE HERE
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    },
//                    Cancel: function () {
//                        $(this).dialog("close");
//                        $scope.$apply();
//                    }
//                }
//            });
        }); // on document ready
    }]);



